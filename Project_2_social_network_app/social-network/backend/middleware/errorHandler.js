const multer = require('multer');

/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Max size is 5MB per file.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `That ${field} is already taken.` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong on the server.',
  });
};

const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
