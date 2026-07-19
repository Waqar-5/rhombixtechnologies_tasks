import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB() {
  if (config.useMock) {
    console.log('[db] USE_MOCK=true → running on local JSON-file storage (no MongoDB required).');
    return { mode: 'mock' };
  }

  try {
    await mongoose.connect(config.mongoUri);
    console.log('[db] Connected to MongoDB at', config.mongoUri);
    return { mode: 'mongo' };
  } catch (err) {
    console.error('[db] Failed to connect to MongoDB, falling back to mock storage:', err.message);
    return { mode: 'mock' };
  }
}
