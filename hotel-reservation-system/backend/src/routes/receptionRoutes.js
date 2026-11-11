const express = require('express');
const router = express.Router();
const {
  getReservationForReception,
  assignRoomToBooking,
  checkInGuest,
  checkOutGuest,
  getReceptionOverview
} = require('../controllers/receptionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('RECEPTIONIST', 'ADMIN'));

router.get('/overview', getReceptionOverview);
router.get('/bookings/:bookingId', getReservationForReception);
router.put('/assign-room', assignRoomToBooking);
router.post('/check-in', checkInGuest);
router.post('/check-out', checkOutGuest);

module.exports = router;

