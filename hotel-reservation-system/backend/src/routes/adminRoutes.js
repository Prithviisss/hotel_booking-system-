const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getRevenueStatistics,
  getCustomersList
} = require('../controllers/adminController');
const { getAllBookings } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getAdminDashboard);
router.get('/revenue', getRevenueStatistics);
router.get('/customers', getCustomersList);
router.get('/bookings', getAllBookings);

module.exports = router;

