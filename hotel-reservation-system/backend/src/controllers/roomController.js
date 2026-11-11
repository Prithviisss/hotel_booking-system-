const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Booking = require('../models/Booking');
const { calculateNights, calculatePricing, releaseExpiredPendingBookings } = require('../utils/bookingUtils');

// @desc    Get all rooms (supports filter by roomType, status, floor)
// @route   GET /api/rooms
// @access  Public
const getAllRooms = async (req, res, next) => {
  try {
    const { roomType, status, floor, search } = req.query;
    let query = {};

    if (roomType) query.roomType = roomType;
    if (status) query.status = status;
    if (floor) query.floor = Number(floor);
    if (search) {
      query.roomNumber = { $regex: search, $options: 'i' };
    }

    const rooms = await Room.find(query)
      .populate('roomType')
      .sort({ roomNumber: 1 });

    res.json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('roomType');
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      room
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private (Admin only)
const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, roomType, floor, status, images, description } = req.body;

    // Check if room number already exists
    const existing = await Room.findOne({ roomNumber: roomNumber.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Room number ${roomNumber} already exists`
      });
    }

    // Verify roomType exists
    const validRoomType = await RoomType.findById(roomType);
    if (!validRoomType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room type selected'
      });
    }

    const room = await Room.create({
      roomNumber: roomNumber.trim(),
      roomType,
      floor: Number(floor),
      status: status || 'AVAILABLE',
      images: images && images.length ? images : validRoomType.images,
      description: description || validRoomType.description
    });

    const populatedRoom = await Room.findById(room._id).populate('roomType');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: populatedRoom
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private (Admin only)
const updateRoom = async (req, res, next) => {
  try {
    const { roomNumber, roomType, floor, status, images, description } = req.body;

    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (roomNumber && roomNumber !== room.roomNumber) {
      const existing = await Room.findOne({ roomNumber: roomNumber.trim(), _id: { $ne: room._id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Room number ${roomNumber} is already in use`
        });
      }
      room.roomNumber = roomNumber.trim();
    }

    if (roomType) room.roomType = roomType;
    if (floor !== undefined) room.floor = Number(floor);
    if (status) room.status = status;
    if (images) room.images = images;
    if (description !== undefined) room.description = description;

    await room.save();
    const updated = await Room.findById(room._id).populate('roomType');

    res.json({
      success: true,
      message: 'Room updated successfully',
      room: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin only)
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Safety check: Check for active reservations
    const activeBooking = await Booking.findOne({
      room: room._id,
      bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN'] },
      checkOutDate: { $gte: new Date() }
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room ${room.roomNumber} because it has an active or upcoming reservation (Booking ID: ${activeBooking.bookingId}). Please reassign or cancel the reservation first.`
      });
    }

    await Room.findByIdAndDelete(room._id);

    res.json({
      success: true,
      message: `Room ${room.roomNumber} deleted successfully`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all room types / categories
// @route   GET /api/rooms/types/all
// @access  Public
const getAllRoomTypes = async (req, res, next) => {
  try {
    const roomTypes = await RoomType.find().sort({ basePrice: 1 });
    res.json({
      success: true,
      count: roomTypes.length,
      roomTypes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a room type
// @route   POST /api/rooms/types
// @access  Private (Admin only)
const createRoomType = async (req, res, next) => {
  try {
    const { name, description, basePrice, maxCapacity, bedType, size, amenities, images } = req.body;
    const roomType = await RoomType.create({
      name,
      description,
      basePrice: Number(basePrice),
      maxCapacity: Number(maxCapacity),
      bedType,
      size,
      amenities: amenities || [],
      images: images || []
    });

    res.status(201).json({
      success: true,
      message: 'Room category created successfully',
      roomType
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a room type
// @route   PUT /api/rooms/types/:id
// @access  Private (Admin only)
const updateRoomType = async (req, res, next) => {
  try {
    const roomType = await RoomType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found'
      });
    }

    res.json({
      success: true,
      message: 'Room category updated successfully',
      roomType
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check room availability for given dates & guests
// @route   POST /api/rooms/availability
// @access  Public
const checkAvailability = async (req, res, next) => {
  try {
    // First, release any abandoned pending bookings that expired
    await releaseExpiredPendingBookings();

    const { checkInDate, checkOutDate, adults = 1, children = 0, roomType } = req.body;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both check-in and check-out dates'
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in or check-out date format'
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be strictly after check-in date'
      });
    }

    const totalGuests = Number(adults) + Number(children);
    const nights = calculateNights(checkIn, checkOut);

    // Find all overlapping bookings using the required formula:
    // existingCheckIn < requestedCheckOut AND existingCheckOut > requestedCheckIn
    // Exclude CANCELLED and EXPIRED bookings, and pending bookings that already expired
    const now = new Date();
    const overlappingBookings = await Booking.find({
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
      bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN', 'PENDING_PAYMENT'] },
      $or: [
        { bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN'] } },
        { bookingStatus: 'PENDING_PAYMENT', reservationExpiresAt: { $gt: now } }
      ]
    }).select('room roomType');

    // Collect IDs of rooms that are booked during this period
    const bookedRoomIds = overlappingBookings
      .filter((b) => b.room)
      .map((b) => b.room.toString());

    // Also count overlapping bookings per roomType for rooms where specific physical room is not yet allocated
    const bookedCountByRoomType = {};
    overlappingBookings.forEach((b) => {
      const typeId = b.roomType.toString();
      bookedCountByRoomType[typeId] = (bookedCountByRoomType[typeId] || 0) + 1;
    });

    // Query rooms that:
    // 1. Are not in MAINTENANCE
    // 2. Are not in bookedRoomIds
    // 3. Meet roomType filter if provided
    let roomFilter = {
      status: { $ne: 'MAINTENANCE' },
      _id: { $nin: bookedRoomIds }
    };

    if (roomType) {
      roomFilter.roomType = roomType;
    }

    const candidateRooms = await Room.find(roomFilter).populate('roomType');

    // Filter candidate rooms where roomType capacity >= totalGuests
    const availableRooms = candidateRooms.filter((room) => {
      if (!room.roomType) return false;
      return room.roomType.maxCapacity >= totalGuests;
    });

    // Group available rooms by RoomType to present summary & options
    const roomTypeMap = {};
    availableRooms.forEach((room) => {
      const type = room.roomType;
      const typeId = type._id.toString();

      if (!roomTypeMap[typeId]) {
        const pricing = calculatePricing(type.basePrice, nights);
        roomTypeMap[typeId] = {
          roomType: type,
          pricing,
          availableCount: 0,
          rooms: []
        };
      }
      roomTypeMap[typeId].availableCount += 1;
      roomTypeMap[typeId].rooms.push({
        _id: room._id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        images: room.images,
        description: room.description
      });
    });

    const availableCategories = Object.values(roomTypeMap);

    res.json({
      success: true,
      searchCriteria: {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nights,
        adults: Number(adults),
        children: Number(children),
        totalGuests
      },
      totalAvailableRooms: availableRooms.length,
      availableCategories,
      availableRooms
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAllRoomTypes,
  createRoomType,
  updateRoomType,
  checkAvailability
};

