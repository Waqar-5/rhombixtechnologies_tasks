import { nanoid } from 'nanoid';
import { config } from '../config/env.js';
import { readDB, writeDB } from './jsonStore.js';
import BookingModel from '../models/Booking.js';

// Mongoose documents/lean objects expose `_id`, not `id`. Every caller
// (controllers, and the frontend after a round trip through JSON) reads
// `.id` uniformly, the same way mock-mode records already do — so this
// normalizes Mongo results to that same shape rather than leaking `_id`.
function normalizeBooking(doc) {
  if (!doc) return null;
  const { _id, __v, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

export async function createBooking(payload) {
  const confirmationCode = `SKY-${nanoid(8).toUpperCase()}`;

  if (config.useMock) {
    const db = readDB();
    const booking = {
      id: `bkg_${nanoid(10)}`,
      ...payload,
      status: 'confirmed',
      confirmationCode,
      createdAt: new Date().toISOString()
    };
    db.bookings.push(booking);
    writeDB(db);
    return booking;
  }

  const booking = await BookingModel.create({ ...payload, status: 'confirmed', confirmationCode });
  return normalizeBooking(booking.toObject());
}

export async function findBookingsByUser(userId) {
  if (config.useMock) {
    const db = readDB();
    return db.bookings
      .filter((b) => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const docs = await BookingModel.find({ userId }).sort({ createdAt: -1 }).lean();
  return docs.map(normalizeBooking);
}

export async function findBookingById(id) {
  if (config.useMock) {
    const db = readDB();
    return db.bookings.find((b) => b.id === id) || null;
  }
  if (!id?.match(/^[0-9a-fA-F]{24}$/)) return null; // not a valid ObjectId — avoid a CastError
  const doc = await BookingModel.findById(id).lean();
  return normalizeBooking(doc);
}

export async function cancelBooking(id, userId) {
  if (config.useMock) {
    const db = readDB();
    const booking = db.bookings.find((b) => b.id === id && b.userId === userId);
    if (!booking) return null;
    booking.status = 'cancelled';
    writeDB(db);
    return booking;
  }
  if (!id?.match(/^[0-9a-fA-F]{24}$/)) return null; // not a valid ObjectId — avoid a CastError
  const doc = await BookingModel.findOneAndUpdate({ _id: id, userId }, { status: 'cancelled' }, { new: true }).lean();
  return normalizeBooking(doc);
}
