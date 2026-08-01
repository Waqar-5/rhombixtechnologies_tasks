const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const makeStorage = (subfolder) => {
  const dest = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueSuffix}${ext}`);
    }
  });
};

const fileFilter = (allowedMimes) => (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedMimes.join(', ')}`), false);
  }
};

const RESUME_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const uploadResume = multer({
  storage: makeStorage('resumes'),
  fileFilter: fileFilter(RESUME_MIMES),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  fileFilter: fileFilter(IMAGE_MIMES),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

const uploadCompanyImage = multer({
  storage: makeStorage('logos'),
  fileFilter: fileFilter(IMAGE_MIMES),
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});

module.exports = { uploadResume, uploadAvatar, uploadCompanyImage };
