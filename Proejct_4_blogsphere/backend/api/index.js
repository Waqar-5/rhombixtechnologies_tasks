/**
 * Vercel serverless entry point.
 *
 * This is deliberately SEPARATE from server.js (used for traditional
 * always-on hosting like Render/Railway/local dev). Serverless functions
 * are stateless and short-lived, which breaks two assumptions the
 * traditional server makes:
 *
 *   1. config/db.js calls process.exit(1) if the initial connection
 *      fails — fine for a long-running process (nothing to serve without
 *      a DB, so crash loudly at boot), but wrong here: killing the
 *      function process mid-request would abort in-flight invocations
 *      and doesn't give the client a clean error response.
 *
 *   2. A traditional server connects to MongoDB once at boot and reuses
 *      that connection forever. A serverless function may run in a fresh
 *      container per request (cold start) or reuse a "warm" one — so we
 *      cache the connection on `global` to reuse it across invocations
 *      within the same warm container, without repeating the boot-time
 *      exit-on-failure behavior.
 */
const mongoose = require('mongoose');
const app = require('../app');
const config = require('../config/env');

// `global` persists across invocations in the same warm Lambda container,
// but NOT across cold starts — this is the standard pattern for reusing
// a Mongo connection in a serverless environment.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectForServerless = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(config.mongoUri, {
        maxPoolSize: 10, // lower than the traditional server's 20 — serverless favors many short-lived connections less than a few reused ones
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset so the NEXT invocation retries the connection instead of
    // permanently caching a rejected promise for the life of the container.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};

module.exports = async (req, res) => {
  try {
    await connectForServerless();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    res.status(503).json({
      success: false,
      message: 'Database connection failed. Please try again in a moment.',
    });
    return;
  }

  return app(req, res);
};
