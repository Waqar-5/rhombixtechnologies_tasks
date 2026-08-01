const express = require('express');
const {
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
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.get('/reset-password/:token/redirect', resetPasswordRedirect);
router.put('/reset-password/:token', resetPassword);
router.put('/change-password', protect, changePassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, authLimiter, resendVerification);
router.post('/resend-verification-public', authLimiter, resendVerificationPublic);

module.exports = router;
