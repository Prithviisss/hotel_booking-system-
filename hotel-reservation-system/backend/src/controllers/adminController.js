const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Get Admin Dashboard Overview Stats & Chart Data
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getAdminDashboard = async (req, res, next) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'AVAILABLE' });
    const occupiedRooms = await Room.countDocuments({ status: 'OCCUPIED' });
    const maintenanceRooms = await Room.countDocuments({ status: 'MAINTENANCE' });
    const totalReservations = await Booking.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });

    // Total revenue from successful payments
    const revenueAgg = await Payment.aggregate([
      { $match: { paymentStatus: 'SUCCESS' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAgg.length ? revenueAgg[0].totalRevenue : 0;

    // Monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenueAgg = await Payment.aggregate([
      {
        $match: {
          paymentStatus: 'SUCCESS',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = monthlyRevenueAgg.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      bookingsCount: item.count
    }));

    // Occupancy by room type
    const roomTypes = await RoomType.find();
    const categoryStats = await Promise.all(
      roomTypes.map(async (type) => {
        const total = await Room.countDocuments({ roomType: type._id });
        const occupied = await Room.countDocuments({ roomType: type._id, status: 'OCCUPIED' });
        const bookingsCount = await Booking.countDocuments({ roomType: type._id });
        return {
          name: type.name,
          totalRooms: total,
          occupiedRooms: occupied,
          availableRooms: Math.max(0, total - occupied),
          totalBookings: bookingsCount,
          basePrice: type.basePrice
        };
      })
    );

    // Recent 6 bookings
    const recentBookings = await Booking.find()
      .populate('room')
      .populate('roomType')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      stats: {
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms,
        totalReservations,
        totalCustomers,
        totalRevenue
      },
      monthlyRevenue,
      categoryStats,
      recentBookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get detailed revenue statistics
// @route   GET /api/admin/revenue
// @access  Private (Admin only)
const getRevenueStatistics = async (req, res, next) => {
  try {
    const totalPayments = await Payment.find().populate('user', 'name email').sort({ createdAt: -1 });

    const totalSuccessfulAmount = totalPayments
      .filter((p) => p.paymentStatus === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefundedAmount = totalPayments
      .filter((p) => p.paymentStatus === 'REFUNDED')
      .reduce((sum, p) => sum + p.amount, 0);

    const netRevenue = totalSuccessfulAmount - totalRefundedAmount;

    res.json({
      success: true,
      summary: {
        grossRevenue: totalSuccessfulAmount,
        refundedRevenue: totalRefundedAmount,
        netRevenue,
        totalTransactions: totalPayments.length
      },
      payments: totalPayments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all customers with stay history & spend
// @route   GET /api/admin/customers
// @access  Private (Admin only)
const getCustomersList = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'CUSTOMER' }).sort({ createdAt: -1 });

    const customerDetails = await Promise.all(
      customers.map(async (cust) => {
        const bookings = await Booking.find({ user: cust._id });
        const confirmedBookings = bookings.filter((b) => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_OUT' || b.bookingStatus === 'CHECKED_IN');
        const totalSpent = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

        return {
          _id: cust._id,
          name: cust.name,
          email: cust.email,
          phone: cust.phone,
          createdAt: cust.createdAt,
          totalBookings: bookings.length,
          confirmedBookings: confirmedBookings.length,
          totalSpent
        };
      })
    );

    res.json({
      success: true,
      count: customerDetails.length,
      customers: customerDetails
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminDashboard,
  getRevenueStatistics,
  getCustomersList
};

