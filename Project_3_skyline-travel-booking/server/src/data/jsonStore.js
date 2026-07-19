import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'db.json');

function ensureFile() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], bookings: [] }, null, 2));
  }
}

export function readDB() {
  ensureFile();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw || '{"users":[],"bookings":[]}');
}

export function writeDB(data) {
  ensureFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
