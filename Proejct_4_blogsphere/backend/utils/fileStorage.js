const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config/env');

// All uploaded images live under backend/uploads/<subfolder>/<random-name>.
// Served publicly via express.static('/uploads', ...) — see app.js.
const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');

const SUBFOLDERS = ['avatars', 'blogs/covers', 'blogs/gallery', 'categories'];

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Create every subfolder once at startup so writes never fail because a
// directory doesn't exist yet (relevant on a totally fresh clone/deploy).
SUBFOLDERS.forEach((sub) => ensureDir(path.join(UPLOADS_ROOT, sub)));

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

/**
 * Writes an in-memory file buffer (from multer's memoryStorage) to disk
 * under the given subfolder, with a random filename to avoid collisions
 * and to avoid leaking the original filename.
 *
 * @param {Buffer} buffer
 * @param {string} subfolder - one of SUBFOLDERS, e.g. 'blogs/covers'
 * @param {string} originalName - original uploaded filename, used only for its extension
 * @returns {{url: string, publicId: string}} publicId is the relative path,
 *          reused as the "identifier" for deletion (mirrors the shape the
 *          rest of the app already expects from the old Cloudinary helper).
 */
const saveBufferToDisk = (buffer, subfolder, originalName = '') => {
  let ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) ext = '.jpg'; // fileFilter already restricts mimetypes upstream; this is just a safe fallback

  const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  const relativePath = `${subfolder}/${filename}`;
  const fullPath = path.join(UPLOADS_ROOT, subfolder, filename);

  fs.writeFileSync(fullPath, buffer);

  return {
    url: `${config.serverUrl}/uploads/${relativePath}`,
    publicId: relativePath,
  };
};

/**
 * Deletes a previously-uploaded file by its relative path (the `publicId`
 * returned from saveBufferToDisk). Never throws — a missing/already-deleted
 * file shouldn't block whatever primary operation triggered the cleanup
 * (e.g. deleting a blog whose cover image was already removed).
 * @param {string} relativePath
 */
const deleteFromDisk = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(UPLOADS_ROOT, relativePath);

  // Guard against path traversal — the resolved path must stay inside
  // UPLOADS_ROOT no matter what publicId value is passed in.
  if (!fullPath.startsWith(UPLOADS_ROOT)) return;

  fs.unlink(fullPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      // eslint-disable-next-line no-console
      console.error(`Failed to delete local file ${relativePath}: ${err.message}`);
    }
  });
};

module.exports = { saveBufferToDisk, deleteFromDisk, UPLOADS_ROOT };
