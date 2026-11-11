require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { releaseExpiredPendingBookings } = require('./utils/bookingUtils');
const Room = require('./models/Room');
const seedDatabase = require('../seed/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database (Atlas or In-Memory fallback)
    await connectDB();

    // 2. Check if DB has rooms; if empty, auto-seed sample dataset
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      console.log('🌱 Database is empty. Running automatic seed script with 5 room types and 25 rooms...');
      await seedDatabase();
    } else {
      console.log(`ℹ️ Database already initialized with ${roomCount} rooms.`);
    }

    // 3. Periodic cleaner for expired pending reservations (every 60 seconds)
    setInterval(async () => {
      await releaseExpiredPendingBookings();
    }, 60 * 1000);

    // 4. Create and start HTTP server
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`
============================================================
🏨 THE GRAND HERITAGE - LUXURY HOTEL RESERVATION SYSTEM
🚀 Backend Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}
🔗 Health Check: http://localhost:${PORT}/api/health
💳 Payment Mode: Razorpay Test / Mock Development Mode Active
============================================================
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received. Closing HTTP server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

