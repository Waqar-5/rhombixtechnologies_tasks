const ApiError = require('../utils/ApiError');
const config = require('../config/env');

/**
 * Catch-all for routes that don't match any defined endpoint.
 * Must be registered AFTER all routes, BEFORE the error handler.
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Normalizes known Mongoose/JWT error types into our ApiError shape so the
 * client always gets a consistent { success, message, errors } response
 * regardless of what threw.
 */
const normalizeError = (err) => {
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.badRequest('Validation failed', errors);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return ApiError.conflict(`${field ? `${field} already exists` : 'Duplicate field value'}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Invalid token. Please log in again.');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Your session has expired. Please log in again.');
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    return ApiError.badRequest(`File upload error: ${err.message}`);
  }

  return err;
};

/**
 * Global error handler — must be the LAST middleware registered in server.js.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const normalized = normalizeError(err);

  const statusCode = normalized.statusCode || 500;
  const isOperational = normalized.isOperational || false;

  // Never leak stack traces or raw error internals in production for
  // unexpected (non-operational) errors — log server-side instead.
  if (!isOperational || statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('💥 ERROR:', err);
  } else if (config.env === 'development') {
    // In dev, also log expected 4xx errors (validation failures, bad
    // requests, etc.) with their field-level detail — this is what shows
    // up in your `npm run dev` terminal so you don't have to dig through
    // DevTools Network tab to see why a request was rejected.
    // eslint-disable-next-line no-console
    console.warn(
      `⚠️  ${statusCode} ${req.method} ${req.originalUrl} — ${normalized.message}`,
      normalized.errors?.length ? normalized.errors : ''
    );
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? normalized.message : 'Something went wrong. Please try again later.',
    errors: normalized.errors || [],
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler, notFoundHandler };
