const crypto = require('crypto');
const Booking = require('../models/Booking');

// Generate unique booking ID like BK-849201
const generateBookingId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `BK-${randomNum}`;
};

// Calculate nights between two dates
const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

// Calculate pricing with Indian Hotel GST slabs
const calculatePricing = (basePrice, nights) => {
  const subtotal = basePrice * nights;
  // Indian GST slab for hotels: 12% for <= 7500/night, 18% for > 7500/night
  const taxRate = basePrice > 7500 ? 0.18 : 0.12;
  const taxes = Math.round(subtotal * taxRate);
  const totalAmount = subtotal + taxes;

  return {
    nights,
    pricePerNight: basePrice,
    subtotal,
    taxRatePercentage: taxRate * 100,
    taxes,
    totalAmount
  };
};

// Calculate cancellation refund according to hotel policy
const calculateCancellationRefund = (checkInDate, totalAmount) => {
  const now = new Date();
  const checkIn = new Date(checkInDate);
  const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

  let cancellationCharges = 0;
  let refundAmount = totalAmount;
  let policyTier = '';

  if (hoursUntilCheckIn > 48) {
    // Free cancellation (> 48 hours)
    cancellationCharges = 0;
    refundAmount = totalAmount;
    policyTier = 'Full Refund (Cancelled > 48 hrs before check-in)';
  } else if (hoursUntilCheckIn >= 24) {
    // 30% charge (24-48 hours)
    cancellationCharges = Math.round(totalAmount * 0.30);
    refundAmount = totalAmount - cancellationCharges;
    policyTier = '70% Refund (Cancelled 24-48 hrs before check-in)';
  } else {
    // Within 24 hours: non-refundable
    cancellationCharges = totalAmount;
    refundAmount = 0;
    policyTier = 'Non-Refundable (Cancelled < 24 hrs before check-in)';
  }

  return {
    hoursUntilCheckIn: Math.round(hoursUntilCheckIn),
    cancellationCharges,
    refundAmount,
    policyTier
  };
};

// Expire pending reservations whose 15-minute lock has expired
const releaseExpiredPendingBookings = async () => {
  try {
    const expiredCount = await Booking.updateMany(
      {
        bookingStatus: 'PENDING_PAYMENT',
        reservationExpiresAt: { $lt: new Date() }
      },
      {
        $set: {
          bookingStatus: 'EXPIRED',
          paymentStatus: 'FAILED'
        }
      }
    );
    if (expiredCount.modifiedCount > 0) {
      console.log(`[Cleaner] Released ${expiredCount.modifiedCount} expired pending booking(s)`);
    }
  } catch (err) {
    console.error('Error releasing expired pending bookings:', err.message);
  }
};

module.exports = {
  generateBookingId,
  calculateNights,
  calculatePricing,
  calculateCancellationRefund,
  releaseExpiredPendingBookings
};

