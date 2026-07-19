import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

// Last-resort safety net for anything outside the Express request cycle
// (route handlers themselves are protected individually by asyncHandler —
// see middleware/asyncHandler.js). This only logs; it does not exit, since
// killing the process here would be the exact failure mode we're guarding
// against.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', mode: config.useMock ? 'mock' : 'mongo' }));

app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use('/api/bookings', bookingRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our end.' });
});

connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`[server] Skyline Travel API running on http://localhost:${config.port}`);
  });
});
