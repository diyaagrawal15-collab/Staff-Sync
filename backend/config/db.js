const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrm_system';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    
    // Set connection timeout so it doesn't block indefinitely if MongoDB service is stopped
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Warning: Could not connect to external MongoDB server (${error.message}).`);
    console.warn(`💡 The server will start in Local In-Memory Fallback Mode so you can use the HRM System immediately!`);
    isConnected = false;
    return false;
  }
};

const getDBStatus = () => ({
  isConnected,
  mode: isConnected ? 'MongoDB (Mongoose)' : 'Local In-Memory Mode'
});

module.exports = { connectDB, getDBStatus };
