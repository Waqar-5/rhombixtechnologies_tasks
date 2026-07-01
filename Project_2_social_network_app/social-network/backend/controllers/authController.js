const User = require('../models/User');
const { generateToken, sendTokenCookie, clearTokenCookie } = require('../utils/token');

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'email' : 'username';
      return res.status(409).json({ message: `That ${field} is already in use.` });
    }

    const user = await User.create({ name, username, email, password });

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({
      user: user.toSafeObject(),
      token,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login existing user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier = email or username

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/username and password are required.' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    user.isOnline = true;
    await user.save();

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.json({
      user: user.toSafeObject(),
      token,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      req.user.isOnline = false;
      req.user.lastSeen = new Date();
      await req.user.save();
    }
    clearTokenCookie(res);
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe };
