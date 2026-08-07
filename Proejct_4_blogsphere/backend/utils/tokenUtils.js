const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');

const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpires });

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpires });

const verifyRefreshToken = (token) => jwt.verify(token, config.jwt.refreshSecret);

/**
 * We never store the raw refresh token in the DB — only its SHA-256 hash.
 * This way, if the database is ever compromised, an attacker can't use the
 * leaked hashes to authenticate (the same principle as password hashing).
 */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Issues a fresh access + refresh token pair, persists the refresh token
 * hash on the user document (enabling server-side revocation), and sets
 * both tokens as httpOnly cookies on the response.
 */
const issueTokens = async (user, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  const isProd = config.isProd;
  const cookieBase = {
    httpOnly: true,
    secure: isProd, // HTTPS only in production
    sameSite: isProd ? 'none' : 'lax', // 'none' needed for cross-site prod deploys (Vercel/Render)
  };

  res.cookie('accessToken', accessToken, {
    ...cookieBase,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieBase,
    maxAge: config.jwt.cookieExpiresDays * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh', // scope the cookie to only be sent to the refresh endpoint
  });

  return { accessToken, refreshToken };
};

const clearAuthCookies = (res) => {
  const isProd = config.isProd;
  const cookieBase = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };
  res.clearCookie('accessToken', cookieBase);
  res.clearCookie('refreshToken', { ...cookieBase, path: '/api/auth/refresh' });
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  issueTokens,
  clearAuthCookies,
};
