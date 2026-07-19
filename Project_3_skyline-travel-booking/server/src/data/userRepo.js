import { nanoid } from 'nanoid';
import { config } from '../config/env.js';
import { readDB, writeDB } from './jsonStore.js';
import UserModel from '../models/User.js';

// Single source of truth for user persistence.
// Routes/controllers never touch mongoose or the JSON file directly —
// they only call these functions, so switching USE_MOCK in .env is the
// only change needed to move from local storage to a real MongoDB.

function normalizeUser(doc) {
  if (!doc) return null;
  const { _id, __v, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

export async function findUserByEmail(email) {
  if (config.useMock) {
    const db = readDB();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }
  const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
  return normalizeUser(doc);
}

export async function findUserById(id) {
  if (config.useMock) {
    const db = readDB();
    return db.users.find((u) => u.id === id) || null;
  }
  if (!OBJECT_ID_RE.test(id || '')) return null; // not a valid ObjectId — avoid a CastError
  const doc = await UserModel.findById(id).lean();
  return normalizeUser(doc);
}

export async function createUser({ name, email, passwordHash }) {
  if (config.useMock) {
    const db = readDB();
    const user = { id: `usr_${nanoid(10)}`, name, email: email.toLowerCase(), passwordHash, createdAt: new Date().toISOString() };
    db.users.push(user);
    writeDB(db);
    return user;
  }
  const user = await UserModel.create({ name, email: email.toLowerCase(), passwordHash });
  return { id: user._id.toString(), name: user.name, email: user.email, passwordHash: user.passwordHash };
}
