const mongoose = require('mongoose');

const cancellationSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cancellationReason: {
      type: String,
      required: [true, 'Please provide cancellation reason']
    },
    cancellationDate: {
      type: Date,
      default: Date.now
    },
    cancellationCharges: {
      type: Number,
      default: 0
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'NOT_APPLICABLE'],
      default: 'PROCESSED'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Cancellation', cancellationSchema);

