const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protects routes - verifies JWT from either the httpOnly cookie or the
 * Authorization header, attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    const cookieName = process.env.COOKIE_NAME || 'pulse_token';
    if (req.cookies && req.cookies[cookieName]) {
      token = req.cookies[cookieName];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized. Invalid or expired token.' });
  }
};

/**
 * Optional auth - attaches req.user if a valid token is present,
 * but does not block the request if not. Useful for endpoints whose
 * response shape depends on whether a viewer is logged in (e.g. privacy checks).
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    const cookieName = process.env.COOKIE_NAME || 'pulse_token';
    if (req.cookies && req.cookies[cookieName]) {
      token = req.cookies[cookieName];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
    next();
  } catch (err) {
    next();
  }
};

module.exports = { protect, optionalAuth };
