const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && !uri.includes('localhost') && !uri.includes('127.0.0.1')) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000
      });
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ Could not connect to Atlas (${err.message}). Falling back to In-Memory MongoDB Server...`);
    }
  }

  // If local URI is provided or Atlas failed
  if (uri && (uri.includes('localhost') || uri.includes('127.0.0.1'))) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ Could not connect to local MongoDB. Falling back to In-Memory MongoDB Server...`);
    }
  }

  // Fallback to MongoMemoryServer for reliable zero-config out-of-the-box operation
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    console.log('Starting In-Memory MongoDB Server for development/testing...');
    mongodInstance = await MongoMemoryServer.create();
    const memUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`✅ In-Memory MongoDB Connected at: ${memUri}`);
    return conn;
  } catch (memErr) {
    console.error('❌ Failed to start In-Memory MongoDB:', memErr.message);
    throw memErr;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };

