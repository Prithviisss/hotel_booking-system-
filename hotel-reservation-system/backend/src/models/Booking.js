const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true
    },
    checkInDate: {
      type: Date,
      required: [true, 'Please provide check-in date']
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Please provide check-out date']
    },
    adults: {
      type: Number,
      required: true,
      min: [1, 'At least 1 adult required'],
      default: 1
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children cannot be negative']
    },
    nights: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    taxes: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    bookingStatus: {
      type: String,
      enum: ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'EXPIRED'],
      default: 'PENDING_PAYMENT',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },
    specialRequests: {
      type: String,
      default: ''
    },
    reservationExpiresAt: {
      type: Date,
      default: null,
      index: true
    },
    guestName: {
      type: String,
      required: true
    },
    guestEmail: {
      type: String,
      required: true
    },
    guestPhone: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for availability check and user queries
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1, bookingStatus: 1 });
bookingSchema.index({ roomType: 1, checkInDate: 1, checkOutDate: 1, bookingStatus: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);

