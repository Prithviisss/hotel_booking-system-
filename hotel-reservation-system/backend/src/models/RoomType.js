const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide room type name'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide room type description']
    },
    basePrice: {
      type: Number,
      required: [true, 'Please provide base price per night in INR'],
      min: [0, 'Base price cannot be negative']
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Please provide max guest capacity'],
      min: [1, 'Capacity must be at least 1']
    },
    bedType: {
      type: String,
      default: 'King Bed'
    },
    size: {
      type: String,
      default: '350 sq.ft'
    },
    amenities: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RoomType', roomTypeSchema);

