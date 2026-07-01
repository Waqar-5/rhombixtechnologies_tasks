const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

// Ensure upload subdirectories exist
['avatars', 'covers', 'posts'].forEach((dir) => {
  const fullPath = path.join(UPLOAD_ROOT, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'posts';
    if (req.baseUrl.includes('users')) {
      subfolder = file.fieldname === 'coverPhoto' ? 'covers' : 'avatars';
    }
    cb(null, path.join(UPLOAD_ROOT, subfolder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const allowedVideoTypes = ['.mp4', '.webm', '.mov'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedImageTypes.includes(ext) || allowedVideoTypes.includes(ext)) {
    return cb(null, true);
  }
  cb(new Error('Unsupported file type. Allowed: jpg, jpeg, png, gif, webp, mp4, webm, mov'));
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize },
});

module.exports = upload;
