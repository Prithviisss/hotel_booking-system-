const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    receptionist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    actualCheckIn: {
      type: Date,
      default: Date.now
    },
    actualCheckOut: {
      type: Date,
      default: null
    },
    assignedRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    roomNumber: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CheckIn', checkInSchema);

