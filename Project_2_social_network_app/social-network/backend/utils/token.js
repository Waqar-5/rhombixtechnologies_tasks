const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenCookie = (res, token) => {
  const cookieName = process.env.COOKIE_NAME || 'pulse_token';
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearTokenCookie = (res) => {
  const cookieName = process.env.COOKIE_NAME || 'pulse_token';
  res.clearCookie(cookieName);
};

module.exports = { generateToken, sendTokenCookie, clearTokenCookie };
