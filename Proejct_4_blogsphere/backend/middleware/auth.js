const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');

/**
 * Verifies the short-lived access token (sent as a Bearer header OR
 * httpOnly cookie) and attaches the authenticated user to req.user.
 * Rejects blocked users and tokens issued before a password change.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('You are not logged in. Please log in to access this resource.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired session. Please log in again.');
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists.');
  }

  if (currentUser.isBlocked) {
    throw ApiError.forbidden('Your account has been blocked. Contact support for assistance.');
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    throw ApiError.unauthorized('Password was changed recently. Please log in again.');
  }

  req.user = currentUser;
  next();
});

/**
 * Like `protect`, but never throws — just attaches req.user if a valid
 * token is present. Used on public routes (e.g. single blog view) that
 * behave slightly differently for logged-in users (e.g. "isLikedByMe").
 */
const attachUserIfPresent = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const currentUser = await User.findById(decoded.id);
    if (currentUser && !currentUser.isBlocked && !currentUser.changedPasswordAfter(decoded.iat)) {
      req.user = currentUser;
    }
  } catch (err) {
    // Silently ignore — this route works fine for guests too.
  }

  next();
});

/**
 * Role-based access control. Usage: restrictTo('admin')
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw ApiError.forbidden('You do not have permission to perform this action.');
  }
  next();
};

module.exports = { protect, attachUserIfPresent, restrictTo };
