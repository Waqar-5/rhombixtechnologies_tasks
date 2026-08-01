const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Company = require('../models/Company');
const { sendTokenResponse, clearTokenCookie } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user (jobseeker or recruiter)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const userRole = role === 'recruiter' ? 'recruiter' : 'jobseeker';

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: userRole
  });

  // Recruiters get a company shell created immediately so they can post jobs right away.
  if (userRole === 'recruiter') {
    const company = await Company.create({
      owner: user._id,
      name: companyName && companyName.trim() ? companyName.trim() : `${name}'s Company`
    });
    user.company = company._id;
    await user.save();
  }

  // Email verification is best-effort: a failure here must never block registration.
  // The account works normally either way — isEmailVerified is informational only.
  try {
    const verifyToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verifyToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify your Nexus Jobs email',
      text: `Welcome to Nexus Jobs! Verify your email address by visiting:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.`
    });
  } catch (error) {
    console.error('Verification email could not be sent:', error.message);
  }

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isEmailVerified) {
    res.status(403).json({
      success: false,
      code: 'EMAIL_NOT_VERIFIED',
      email: user.email,
      message: 'Please verify your email before logging in — check your inbox for the link.'
    });
    return;
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Logout - clears auth cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('company');
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Request a password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  // Always respond with success to avoid leaking which emails are registered.
  const genericResponse = {
    success: true,
    message: 'If an account exists for this email, a reset link has been sent'
  };

  if (!user) {
    res.status(200).json(genericResponse);
    return;
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Points at the backend directly so the link always resolves, even if the
  // frontend dev server happens to be down when the user clicks it. The
  // backend validates the token then redirects into the SPA reset screen.
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}/redirect`;

  const message = `You requested a password reset for your Nexus Jobs account.\n\nClick the link below (valid for ${
    process.env.RESET_TOKEN_EXPIRE_MINUTES || 30
  } minutes):\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Nexus Jobs password',
      text: message
    });
    res.status(200).json(genericResponse);
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent, please try again later');
  }
});

// @desc    Redirect helper - validates token then forwards to the SPA with token in query
// @route   GET /api/auth/reset-password/:token/redirect
// @access  Public
const resetPasswordRedirect = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (!user) {
    res.redirect(`${clientUrl}/reset-password?error=invalid_or_expired`);
    return;
  }

  res.redirect(`${clientUrl}/reset-password?token=${req.params.token}`);
});

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters');
  }

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Reset token is invalid or has expired');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Change password while logged in
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400);
    throw new Error('Current and new password (min 8 chars) are required');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

// @desc    Verify email via token link (redirects into the SPA with a status flag).
//          Points at the backend directly, same reasoning as the password reset
//          link: it always resolves even if the frontend dev server is down.
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.redirect(`${clientUrl}/verify-email?status=invalid`);
    return;
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.redirect(`${clientUrl}/verify-email?status=success`);
});

// @desc    Resend the verification email to the logged-in user
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.isEmailVerified) {
    res.status(200).json({ success: true, message: 'Your email is already verified' });
    return;
  }

  const verifyToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verifyToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your Nexus Jobs email',
      text: `Verify your email address by visiting:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.`
    });
    res.status(200).json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    res.status(500);
    throw new Error('Could not send verification email — please try again later');
  }
});

// @desc    Resend the verification email using just an email address — for
//          people who are blocked from logging in specifically because
//          they're unverified, and therefore can't reach the authenticated
//          resend button on the dashboard.
// @route   POST /api/auth/resend-verification-public
// @access  Public
const resendVerificationPublic = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Always respond with success to avoid leaking which emails are registered.
  const genericResponse = {
    success: true,
    message: 'If an unverified account exists for this email, a new link has been sent'
  };

  if (!email) {
    res.status(200).json(genericResponse);
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.isEmailVerified) {
    res.status(200).json(genericResponse);
    return;
  }

  const verifyToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verifyToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your Nexus Jobs email',
      text: `Verify your email address by visiting:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.`
    });
  } catch (error) {
    console.error('Verification email could not be sent:', error.message);
  }

  res.status(200).json(genericResponse);
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPasswordRedirect,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerification,
  resendVerificationPublic
};
