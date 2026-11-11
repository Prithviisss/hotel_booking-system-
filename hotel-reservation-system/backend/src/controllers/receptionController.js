const Booking = require('../models/Booking');
const Room = require('../models/Room');
const CheckIn = require('../models/CheckIn');
const Payment = require('../models/Payment');

// @desc    Search reservation by bookingId or guest name/email
// @route   GET /api/reception/bookings/:bookingId
// @access  Private (Receptionist, Admin)
const getReservationForReception = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    let query = {};
    if (bookingId.startsWith('BK-')) {
      query = { bookingId };
    } else if (bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: bookingId };
    } else {
      query = {
        $or: [
          { bookingId: { $regex: bookingId, $options: 'i' } },
          { guestName: { $regex: bookingId, $options: 'i' } },
          { guestEmail: { $regex: bookingId, $options: 'i' } },
          { guestPhone: { $regex: bookingId, $options: 'i' } }
        ]
      };
    }

    const booking = await Booking.findOne(query)
      .populate('room')
      .populate('roomType')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No reservation found matching search criteria'
      });
    }

    // Find available rooms of this roomType in case receptionist wants to reassign
    const availableRooms = await Room.find({
      roomType: booking.roomType._id,
      status: 'AVAILABLE'
    });

    const payment = await Payment.findOne({ booking: booking._id }).sort({ createdAt: -1 });
    const checkInRecord = await CheckIn.findOne({ booking: booking._id });

    res.json({
      success: true,
      booking,
      payment,
      checkInRecord,
      availableRoomsForAssignment: availableRooms
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign physical room to booking
// @route   PUT /api/reception/assign-room
// @access  Private (Receptionist, Admin)
const assignRoomToBooking = async (req, res, next) => {
  try {
    const { bookingId, roomId } = req.body;

    const booking = await Booking.findOne({
      $or: [{ bookingId }, { _id: bookingId.match(/^[0-9a-fA-F]{24}$/) ? bookingId : null }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const room = await Room.findById(roomId).populate('roomType');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.status === 'MAINTENANCE') {
      return res.status(400).json({ success: false, message: `Room ${room.roomNumber} is currently under maintenance` });
    }

    // Check if room belongs to booking room type
    if (room.roomType._id.toString() !== booking.roomType.toString()) {
      return res.status(400).json({
        success: false,
        message: `Selected room type (${room.roomType.name}) does not match booked category.`
      });
    }

    // Free previous room if occupied
    if (booking.room && booking.room.toString() !== room._id.toString() && booking.bookingStatus === 'CHECKED_IN') {
      await Room.findByIdAndUpdate(booking.room, { status: 'AVAILABLE' });
    }

    booking.room = room._id;
    await booking.save();

    if (booking.bookingStatus === 'CHECKED_IN') {
      await Room.findByIdAndUpdate(room._id, { status: 'OCCUPIED' });
    }

    const updated = await Booking.findById(booking._id).populate('room').populate('roomType');

    res.json({
      success: true,
      message: `Room ${room.roomNumber} assigned successfully to booking ${booking.bookingId}`,
      booking: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check-in guest
// @route   POST /api/reception/check-in
// @access  Private (Receptionist, Admin)
const checkInGuest = async (req, res, next) => {
  try {
    const { bookingId, roomId, notes = '' } = req.body;

    const booking = await Booking.findOne({
      $or: [{ bookingId }, { _id: bookingId.match(/^[0-9a-fA-F]{24}$/) ? bookingId : null }]
    }).populate('roomType');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus === 'CHECKED_IN') {
      return res.status(400).json({ success: false, message: 'Guest has already checked in' });
    }

    if (booking.bookingStatus === 'CHECKED_OUT') {
      return res.status(400).json({ success: false, message: 'This reservation is already checked out' });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Cannot check in a cancelled reservation' });
    }

    // Determine room
    let targetRoomId = roomId || booking.room;
    if (!targetRoomId) {
      const firstAvailable = await Room.findOne({
        roomType: booking.roomType._id,
        status: 'AVAILABLE'
      });
      if (!firstAvailable) {
        return res.status(400).json({
          success: false,
          message: 'No available rooms found in this category. Please allocate a room manually.'
        });
      }
      targetRoomId = firstAvailable._id;
    }

    const room = await Room.findById(targetRoomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Update Room status to OCCUPIED
    room.status = 'OCCUPIED';
    await room.save();

    // Update Booking status
    booking.bookingStatus = 'CHECKED_IN';
    booking.room = room._id;
    await booking.save();

    // Create CheckIn record
    const checkIn = await CheckIn.create({
      booking: booking._id,
      receptionist: req.user.id,
      actualCheckIn: new Date(),
      assignedRoom: room._id,
      roomNumber: room.roomNumber,
      notes
    });

    const updatedBooking = await Booking.findById(booking._id)
      .populate('room')
      .populate('roomType')
      .populate('user', 'name email phone');

    res.json({
      success: true,
      message: `Guest successfully checked in to Room ${room.roomNumber}!`,
      booking: updatedBooking,
      checkIn
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check-out guest
// @route   POST /api/reception/check-out
// @access  Private (Receptionist, Admin)
const checkOutGuest = async (req, res, next) => {
  try {
    const { bookingId, notes = '' } = req.body;

    const booking = await Booking.findOne({
      $or: [{ bookingId }, { _id: bookingId.match(/^[0-9a-fA-F]{24}$/) ? bookingId : null }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus !== 'CHECKED_IN') {
      return res.status(400).json({
        success: false,
        message: `Cannot check out. Booking status is '${booking.bookingStatus}', but must be 'CHECKED_IN'.`
      });
    }

    // Free the room back to AVAILABLE
    if (booking.room) {
      await Room.findByIdAndUpdate(booking.room, { status: 'AVAILABLE' });
    }

    // Update Booking status to CHECKED_OUT
    booking.bookingStatus = 'CHECKED_OUT';
    await booking.save();

    // Update CheckIn record with actualCheckOut timestamp
    const checkInRecord = await CheckIn.findOneAndUpdate(
      { booking: booking._id, actualCheckOut: null },
      {
        actualCheckOut: new Date(),
        notes: notes ? notes : undefined
      },
      { new: true }
    );

    const updatedBooking = await Booking.findById(booking._id)
      .populate('room')
      .populate('roomType')
      .populate('user', 'name email phone');

    res.json({
      success: true,
      message: `Guest successfully checked out! Room is now marked AVAILABLE.`,
      booking: updatedBooking,
      checkInRecord
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Receptionist Overview (Today's arrivals/departures, occupied rooms, room matrix)
// @route   GET /api/reception/overview
// @access  Private (Receptionist, Admin)
const getReceptionOverview = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Upcoming check-ins today
    const todaysCheckIns = await Booking.find({
      checkInDate: { $gte: todayStart, $lte: todayEnd },
      bookingStatus: { $in: ['CONFIRMED', 'PENDING_PAYMENT'] }
    })
      .populate('room')
      .populate('roomType')
      .sort({ checkInDate: 1 });

    // Upcoming check-outs today
    const todaysCheckOuts = await Booking.find({
      checkOutDate: { $gte: todayStart, $lte: todayEnd },
      bookingStatus: 'CHECKED_IN'
    })
      .populate('room')
      .populate('roomType')
      .sort({ checkOutDate: 1 });

    // Currently occupied rooms
    const occupiedBookings = await Booking.find({
      bookingStatus: 'CHECKED_IN'
    })
      .populate('room')
      .populate('roomType')
      .populate('user', 'name email phone');

    // All rooms matrix
    const allRooms = await Room.find().populate('roomType').sort({ roomNumber: 1 });

    res.json({
      success: true,
      summary: {
        todaysCheckInsCount: todaysCheckIns.length,
        todaysCheckOutsCount: todaysCheckOuts.length,
        currentlyOccupiedCount: occupiedBookings.length,
        totalRoomsCount: allRooms.length
      },
      todaysCheckIns,
      todaysCheckOuts,
      occupiedBookings,
      allRooms
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getReservationForReception,
  assignRoomToBooking,
  checkInGuest,
  checkOutGuest,
  getReceptionOverview
};

