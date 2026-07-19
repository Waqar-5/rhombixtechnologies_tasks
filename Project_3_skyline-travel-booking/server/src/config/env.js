import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  useMock: process.env.USE_MOCK !== 'false', // defaults to true unless explicitly disabled
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skyline-travel',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  stripeKey: process.env.STRIPE_SECRET_KEY || ''
};
