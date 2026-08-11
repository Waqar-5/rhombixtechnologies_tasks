const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/apiResponse');
const { issueTokens, clearAuthCookies, verifyRefreshToken, signAccessToken, hashToken } = require('../utils/tokenUtils');
const emailService = require('../services/emailService');
const { createNotification } = require('../services/notificationService');
const config = require('../config/env');

/**
 * @desc    Register a new user, send verification email. Deliberately does
 *          NOT log the user in — they land back on the login page and
 *          authenticate explicitly, so the email-verification link they
 *          click actually matters instead of being skipped past.
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({ name, email, password });

  const rawToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Email delivery failures shouldn't block registration — log and continue
  // so the user isn't stuck; they can request a resend later.
  try {
    await emailService.sendVerificationEmail(user, rawToken);
    await emailService.sendWelcomeEmail(user);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Failed to send registration emails: ${err.message}`);
  }

  await createNotification({
    recipient: user._id,
    type: 'welcome',
    message: 'Welcome to BlogSphere! Start by completing your profile.',
    link: '/profile',
  });

  sendResponse(res, 201, 'Registration successful. Please check your email to verify your account, then log in.', {
    user,
  });
});

/**
 * @desc    Log in an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Incorrect email or password');
  }

  if (user.isBlocked) {
    throw ApiError.forbidden('Your account has been blocked. Contact support for assistance.');
  }

  const { accessToken } = await issueTokens(user, res);
  user.password = undefined;

  sendResponse(res, 200, 'Login successful', { user, accessToken });
});

/**
 * @desc    Log out — clear cookies and invalidate the stored refresh token
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshTokenHash = undefined;
    await req.user.save({ validateBeforeSave: false });
  }
  clearAuthCookies(res);
  sendResponse(res, 200, 'Logged out successfully');
});

/**
 * @desc    Exchange a valid refresh token (cookie) for a new access token
 * @route   POST /api/auth/refresh
 * @access  Public (requires refreshToken cookie)
 */
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw ApiError.unauthorized('No refresh token provided. Please log in again.');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token. Please log in again.');
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== hashToken(token)) {
    // Token reuse or a stale/revoked token — force re-login.
    throw ApiError.unauthorized('Session is no longer valid. Please log in again.');
  }

  if (user.isBlocked) {
    throw ApiError.forbidden('Your account has been blocked. Contact support for assistance.');
  }

  const accessToken = signAccessToken(user._id);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
  });

  sendResponse(res, 200, 'Token refreshed', { accessToken });
});

/**
 * @desc    Verify a user's email using the token emailed to them
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    throw ApiError.badRequest('Verification link is invalid or has expired');
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  sendResponse(res, 200, 'Email verified successfully');
});

/**
 * @desc    Resend the email verification link
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
const resendVerification = asyncHandler(async (req, res) => {
  if (req.user.isVerified) {
    throw ApiError.badRequest('Your email is already verified');
  }

  const rawToken = req.user.createEmailVerificationToken();
  await req.user.save({ validateBeforeSave: false });

  await emailService.sendVerificationEmail(req.user, rawToken);

  sendResponse(res, 200, 'Verification email sent');
});

/**
 * @desc    Request a password reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // Always respond with the same message whether or not the account exists,
  // to avoid leaking which emails are registered.
  const genericMessage = 'If an account with that email exists, a reset link has been sent.';

  if (!user) {
    return sendResponse(res, 200, genericMessage);
  }

  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await emailService.sendPasswordResetEmail(user, rawToken);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw ApiError.internal('Failed to send password reset email. Please try again.');
  }

  sendResponse(res, 200, genericMessage);
});

/**
 * @desc    Reset password using the token emailed to the user
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw ApiError.badRequest('Password reset link is invalid or has expired');
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokenHash = undefined; // force logout of all existing sessions
  await user.save();

  clearAuthCookies(res);
  sendResponse(res, 200, 'Password reset successful. Please log in with your new password.');
});

/**
 * @desc    Change password while logged in
 * @route   PATCH /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshTokenHash = undefined; // force re-login on other devices
  await user.save();

  clearAuthCookies(res);
  sendResponse(res, 200, 'Password changed successfully. Please log in again.');
});

/**
 * @desc    Get the currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  sendResponse(res, 200, 'Current user fetched', { user: req.user });
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
};
