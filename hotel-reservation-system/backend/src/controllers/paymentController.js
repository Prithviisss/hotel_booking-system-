const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { razorpayInstance, isMockMode, razorpayKeyId } = require('../config/razorpay');

// Helper to find booking flexibly by bookingId string or ObjectId
const findBooking = async (idOrBookingId) => {
  if (!idOrBookingId) return null;
  const isMongoId = typeof idOrBookingId === 'string' && idOrBookingId.match(/^[0-9a-fA-F]{24}$/);
  return await Booking.findOne({
    $or: [
      { bookingId: idOrBookingId },
      ...(isMongoId ? [{ _id: idOrBookingId }] : [])
    ]
  }).populate('roomType');
};

// @desc    Create Razorpay Order (or Mock Order) for a pending booking
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId'
      });
    }

    const booking = await findBooking(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking status
    if (booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid and confirmed'
      });
    }

    if (booking.bookingStatus === 'CANCELLED' || booking.bookingStatus === 'EXPIRED') {
      return res.status(400).json({
        success: false,
        message: `Cannot process payment for ${booking.bookingStatus.toLowerCase()} booking`
      });
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(booking.totalAmount * 100);

    // If real Razorpay credentials are ready (bypassed if in mock mode)
    if (razorpayInstance && !isMockMode) {
      try {
        const options = {
          amount: amountInPaise,
          currency: 'INR',
          receipt: booking.bookingId,
          notes: {
            bookingId: booking.bookingId,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail
          }
        };

        const order = await razorpayInstance.orders.create(options);

        return res.json({
          success: true,
          orderId: order.id,
          amount: booking.totalAmount,
          amountInPaise,
          currency: 'INR',
          keyId: razorpayKeyId,
          bookingId: booking.bookingId,
          isMockMode: false
        });
      } catch (rzpErr) {
        console.warn('Razorpay order creation failed, falling back to mock:', rzpErr.message);
      }
    }

    // Generate mock order
    const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return res.json({
      success: true,
      orderId: mockOrderId,
      amount: booking.totalAmount,
      amountInPaise,
      currency: 'INR',
      keyId: razorpayKeyId || 'rzp_test_mock',
      bookingId: booking.bookingId,
      isMockMode: true,
      message: 'Mock Payment Mode is enabled. Choose a simulation scenario to proceed.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay payment signature or process mock simulation
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isMock = false,
      simulationType = 'SUCCESS' // 'SUCCESS' | 'FAILED' | 'CANCEL'
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId'
      });
    }

    const booking = await findBooking(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Determine user ID (fallback to booking.user if req.user is absent)
    const userId = (req.user && req.user._id) || (req.user && req.user.id) || booking.user;

    // Prevent duplicate verification
    if (booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'SUCCESS') {
      const existingPayment = await Payment.findOne({ booking: booking._id, paymentStatus: 'SUCCESS' });
      return res.json({
        success: true,
        message: 'Payment already verified and reservation confirmed',
        booking,
        payment: existingPayment
      });
    }

    // 1. Mock simulation flow (or when signature is omitted)
    if (isMock || isMockMode || !razorpay_signature) {
      if (simulationType === 'FAILED') {
        booking.paymentStatus = 'FAILED';
        await booking.save();

        await Payment.create({
          booking: booking._id,
          user: userId,
          razorpayOrderId: razorpay_order_id || 'mock_order_fail',
          razorpayPaymentId: `pay_mock_fail_${Date.now()}`,
          amount: booking.totalAmount,
          currency: 'INR',
          paymentMethod: 'Mock Gateway (Simulated Failure)',
          paymentStatus: 'FAILED',
          transactionReference: `TXN-FAIL-${Date.now()}`,
          isMockPayment: true
        });

        return res.status(400).json({
          success: false,
          message: 'Payment simulation failed. Your card was not charged.'
        });
      }

      if (simulationType === 'CANCEL') {
        return res.status(400).json({
          success: false,
          message: 'Payment process was cancelled by the user.'
        });
      }

      // Successful Mock Simulation
      const mockPayId = razorpay_payment_id || `pay_mock_${Date.now()}`;
      const txnRef = `TXN-MOCK-${Math.floor(100000 + Math.random() * 900000)}`;

      booking.bookingStatus = 'CONFIRMED';
      booking.paymentStatus = 'SUCCESS';
      booking.reservationExpiresAt = null; // Clear lock expiry on successful confirmation
      await booking.save();

      const payment = await Payment.create({
        booking: booking._id,
        user: userId,
        razorpayOrderId: razorpay_order_id || 'mock_order_success',
        razorpayPaymentId: mockPayId,
        razorpaySignature: 'MOCK_SIGNATURE_VERIFIED',
        amount: booking.totalAmount,
        currency: 'INR',
        paymentMethod: 'Razorpay Test Mode (Simulated)',
        paymentStatus: 'SUCCESS',
        transactionReference: txnRef,
        isMockPayment: true
      });

      const updatedBooking = await Booking.findById(booking._id)
        .populate('room')
        .populate('roomType');

      return res.json({
        success: true,
        message: 'Payment verified successfully! Reservation is confirmed.',
        booking: updatedBooking,
        payment,
        isMockPayment: true
      });
    }

    // 2. Real Razorpay Signature Verification
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      booking.paymentStatus = 'FAILED';
      await booking.save();

      await Payment.create({
        booking: booking._id,
        user: userId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: booking.totalAmount,
        currency: 'INR',
        paymentMethod: 'Razorpay Test Mode',
        paymentStatus: 'FAILED',
        transactionReference: `TXN-FAILED-${Date.now()}`,
        isMockPayment: false
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid cryptographic signature.'
      });
    }

    // Success with real Razorpay
    booking.bookingStatus = 'CONFIRMED';
    booking.paymentStatus = 'SUCCESS';
    booking.reservationExpiresAt = null;
    await booking.save();

    const payment = await Payment.create({
      booking: booking._id,
      user: userId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: booking.totalAmount,
      currency: 'INR',
      paymentMethod: 'Razorpay Test Gateway',
      paymentStatus: 'SUCCESS',
      transactionReference: `TXN-RZP-${razorpay_payment_id.slice(-8)}`,
      isMockPayment: false
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('room')
      .populate('roomType');

    res.json({
      success: true,
      message: 'Payment verified and reservation confirmed!',
      booking: populatedBooking,
      payment,
      isMockPayment: false
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payment details for a booking
// @route   GET /api/payments/:bookingId
// @access  Private
const getPaymentByBookingId = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await findBooking(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const payment = await Payment.findOne({ booking: booking._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      payment,
      bookingSummary: {
        bookingId: booking.bookingId,
        totalAmount: booking.totalAmount,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentByBookingId
};
