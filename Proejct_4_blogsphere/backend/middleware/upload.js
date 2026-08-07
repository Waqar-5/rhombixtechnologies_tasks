const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Memory storage — files are buffered in RAM, then written to local disk
// via utils/fileStorage.js (which each controller calls after multer
// finishes parsing the request).
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 5;

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      ApiError.badRequest(
        `Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, GIF.`
      ),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

module.exports = {
  uploadSingle: (fieldName) => upload.single(fieldName),
  uploadMultiple: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),
  // For blog create/update: one cover image + up to 5 gallery images in a
  // single multipart request.
  uploadBlogImages: upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 5 },
  ]),
};
