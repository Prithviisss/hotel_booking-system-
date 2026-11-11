const Booking = require('../models/Booking');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Cancellation = require('../models/Cancellation');
const Payment = require('../models/Payment');
const {
  generateBookingId,
  calculateNights,
  calculatePricing,
  calculateCancellationRefund,
  releaseExpiredPendingBookings
} = require('../utils/bookingUtils');

// @desc    Create a new booking reservation (with atomic lock & 15m expiry)
// @route   POST /api/bookings
// @access  Private (Authenticated Customer or Admin)
const createBooking = async (req, res, next) => {
  try {
    await releaseExpiredPendingBookings();

    const {
      roomType: roomTypeId,
      roomId,
      checkInDate,
      checkOutDate,
      adults = 1,
      children = 0,
      specialRequests = '',
      guestName,
      guestEmail,
      guestPhone
    } = req.body;

    if (!roomTypeId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide room type, check-in date, and check-out date'
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be strictly after check-in date'
      });
    }

    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Selected room category does not exist'
      });
    }

    const totalGuests = Number(adults) + Number(children);
    if (totalGuests > roomType.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `Maximum capacity for ${roomType.name} is ${roomType.maxCapacity} guests. You requested ${totalGuests}.`
      });
    }

    const nights = calculateNights(checkIn, checkOut);
    const pricing = calculatePricing(roomType.basePrice, nights);

    // Concurrency / Overlap prevention:
    // Find all overlapping bookings for this period
    const now = new Date();
    const overlappingBookings = await Booking.find({
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
      bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN', 'PENDING_PAYMENT'] },
      $or: [
        { bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN'] } },
        { bookingStatus: 'PENDING_PAYMENT', reservationExpiresAt: { $gt: now } }
      ]
    }).select('room');

    const bookedRoomIds = overlappingBookings
      .filter((b) => b.room)
      .map((b) => b.room.toString());

    // Select target physical room:
    // If user requested a specific roomId, check if it's available
    let assignedRoom = null;
    if (roomId) {
      if (bookedRoomIds.includes(roomId.toString())) {
        return res.status(409).json({
          success: false,
          message: 'The selected room is no longer available for the specified dates. Please select another room or category.'
        });
      }

      const targetRoom = await Room.findOne({
        _id: roomId,
        roomType: roomTypeId,
        status: { $ne: 'MAINTENANCE' }
      });
      if (!targetRoom) {
        return res.status(409).json({
          success: false,
          message: 'The selected room is no longer available for the specified dates or is under maintenance.'
        });
      }
      assignedRoom = targetRoom;
    } else {
      // Pick first available room of this category
      assignedRoom = await Room.findOne({
        roomType: roomTypeId,
        status: { $ne: 'MAINTENANCE' },
        _id: { $nin: bookedRoomIds }
      });

      if (!assignedRoom) {
        return res.status(409).json({
          success: false,
          message: `No ${roomType.name} rooms are available for the selected dates (${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()}). Please try different dates or another category.`
        });
      }
    }

    // Atomic Booking creation with temporary 15-minute reservation lock
    const bookingId = generateBookingId();
    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes to complete payment

    const booking = await Booking.create({
      bookingId,
      user: req.user.id,
      room: assignedRoom._id,
      roomType: roomType._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults: Number(adults),
      children: Number(children),
      nights,
      subtotal: pricing.subtotal,
      taxes: pricing.taxes,
      totalAmount: pricing.totalAmount,
      bookingStatus: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      specialRequests: specialRequests || '',
      reservationExpiresAt,
      guestName: guestName || req.user.name,
      guestEmail: guestEmail || req.user.email,
      guestPhone: guestPhone || req.user.phone
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('room')
      .populate('roomType')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Reservation initiated. Please complete payment within 15 minutes to confirm.',
      booking: populatedBooking,
      pricing
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get customer's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Customer)
const getMyBookings = async (req, res, next) => {
  try {
    await releaseExpiredPendingBookings();

    const bookings = await Booking.find({ user: req.user.id })
      .populate('room')
      .populate('roomType')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking by ID (or bookingId)
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    await releaseExpiredPendingBookings();

    const idOrBookingId = req.params.id;
    let query = {};
    if (idOrBookingId.startsWith('BK-')) {
      query = { bookingId: idOrBookingId };
    } else {
      query = { _id: idOrBookingId };
    }

    const booking = await Booking.findOne(query)
      .populate('room')
      .populate('roomType')
      .populate('user', 'name email phone role');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Role check: Customer can only view their own bookings
    if (req.user.role === 'CUSTOMER' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    // Fetch related payment or cancellation details if present
    const payment = await Payment.findOne({ booking: booking._id }).sort({ createdAt: -1 });
    const cancellation = await Cancellation.findOne({ booking: booking._id });

    res.json({
      success: true,
      booking,
      payment,
      cancellation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings (Admin & Receptionist)
// @route   GET /api/bookings
// @access  Private (Admin, Receptionist)
const getAllBookings = async (req, res, next) => {
  try {
    await releaseExpiredPendingBookings();

    const { status, search, startDate, endDate, page = 1, limit = 50 } = req.query;
    let query = {};

    if (status && status !== 'ALL') {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { guestName: { $regex: search, $options: 'i' } },
        { guestEmail: { $regex: search, $options: 'i' } },
        { guestPhone: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.checkInDate = {};
      if (startDate) query.checkInDate.$gte = new Date(startDate);
      if (endDate) query.checkInDate.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('room')
      .populate('roomType')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a booking
// @route   POST /api/bookings/:id/cancel
// @access  Private (Customer owner or Admin)
const cancelBooking = async (req, res, next) => {
  try {
    const { reason = 'Customer requested cancellation' } = req.body;
    const idOrBookingId = req.params.id;

    let query = {};
    if (idOrBookingId.startsWith('BK-')) {
      query = { bookingId: idOrBookingId };
    } else {
      query = { _id: idOrBookingId };
    }

    const booking = await Booking.findOne(query);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Role check: Only booking owner or Admin can cancel
    if (req.user.role === 'CUSTOMER' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this reservation'
      });
    }

    // Check if cancellation is allowed
    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled'
      });
    }

    if (booking.bookingStatus === 'CHECKED_IN' || booking.bookingStatus === 'CHECKED_OUT') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status ${booking.bookingStatus}`
      });
    }

    // Calculate cancellation policy refund
    const refundDetails = calculateCancellationRefund(booking.checkInDate, booking.totalAmount);

    booking.bookingStatus = 'CANCELLED';
    if (booking.paymentStatus === 'SUCCESS') {
      booking.paymentStatus = refundDetails.refundAmount > 0 ? 'REFUNDED' : 'SUCCESS';
    }
    await booking.save();

    // Create cancellation record
    const cancellation = await Cancellation.create({
      booking: booking._id,
      user: req.user.id,
      cancellationReason: reason,
      cancellationDate: new Date(),
      cancellationCharges: refundDetails.cancellationCharges,
      refundAmount: refundDetails.refundAmount,
      refundStatus: refundDetails.refundAmount > 0 ? 'PROCESSED' : 'NOT_APPLICABLE'
    });

    // If payment was completed, update Payment record status
    if (booking.paymentStatus === 'REFUNDED') {
      await Payment.findOneAndUpdate(
        { booking: booking._id, paymentStatus: 'SUCCESS' },
        { paymentStatus: 'REFUNDED' }
      );
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('room')
      .populate('roomType')
      .populate('user', 'name email phone');

    res.json({
      success: true,
      message: 'Booking cancelled successfully according to hotel cancellation policy',
      booking: updatedBooking,
      cancellation,
      refundDetails
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Preview cancellation policy calculation without cancelling
// @route   GET /api/bookings/:id/cancel-preview
// @access  Private
const previewCancellation = async (req, res, next) => {
  try {
    const idOrBookingId = req.params.id;
    let query = idOrBookingId.startsWith('BK-') ? { bookingId: idOrBookingId } : { _id: idOrBookingId };

    const booking = await Booking.findOne(query);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const refundDetails = calculateCancellationRefund(booking.checkInDate, booking.totalAmount);

    res.json({
      success: true,
      refundDetails,
      booking: {
        bookingId: booking.bookingId,
        checkInDate: booking.checkInDate,
        totalAmount: booking.totalAmount
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  cancelBooking,
  previewCancellation
};
