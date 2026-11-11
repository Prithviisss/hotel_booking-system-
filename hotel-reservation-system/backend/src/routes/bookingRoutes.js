const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  cancelBooking,
  previewCancellation
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// All booking routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/', authorize('ADMIN', 'RECEPTIONIST'), getAllBookings);
router.get('/:id', getBookingById);
router.get('/:id/cancel-preview', previewCancellation);
router.post('/:id/cancel', cancelBooking);

module.exports = router;

