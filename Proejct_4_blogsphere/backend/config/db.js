const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connects to MongoDB via Mongoose.
 * Exits the process on failure since the API is useless without a DB —
 * better to fail loudly at boot than serve broken requests.
 */
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(config.mongoUri, {
      // Modern mongoose (6+/8+) no longer needs useNewUrlParser/useUnifiedTopology,
      // but these options keep connection pooling sane in production.
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 10000,
    });

    // eslint-disable-next-line no-console
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      // eslint-disable-next-line no-console
      console.warn('MongoDB disconnected. Attempting to reconnect is handled by the driver.');
    });

    return conn;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
