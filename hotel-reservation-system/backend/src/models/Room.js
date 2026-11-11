const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide room number'],
      unique: true,
      trim: true
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'Please select room type']
    },
    floor: {
      type: Number,
      required: [true, 'Please provide floor number'],
      min: [1, 'Floor must be at least 1']
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'],
      default: 'AVAILABLE'
    },
    images: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes
roomSchema.index({ roomType: 1, status: 1 });

module.exports = mongoose.model('Room', roomSchema);

