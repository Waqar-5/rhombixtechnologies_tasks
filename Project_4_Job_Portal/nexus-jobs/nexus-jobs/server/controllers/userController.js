const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'headline',
    'bio',
    'location',
    'phone',
    'skills',
    'experience',
    'education',
    'socialLinks'
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  }).populate('company');

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Upload / replace resume
// @route   POST /api/users/resume
// @access  Private (jobseeker)
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No resume file uploaded');
  }

  const user = await User.findById(req.user._id);

  // Remove previous resume file from disk if it exists
  if (user.resume && user.resume.filename) {
    const oldPath = path.join(__dirname, '..', 'uploads', 'resumes', user.resume.filename);
    fs.unlink(oldPath, () => {});
  }

  user.resume = {
    url: `/uploads/resumes/${req.file.filename}`,
    filename: req.file.filename,
    originalName: req.file.originalname,
    uploadedAt: new Date()
  };
  await user.save();

  res.status(200).json({ success: true, resume: user.resume });
});

// @desc    Delete resume
// @route   DELETE /api/users/resume
// @access  Private (jobseeker)
const deleteResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.resume && user.resume.filename) {
    const oldPath = path.join(__dirname, '..', 'uploads', 'resumes', user.resume.filename);
    fs.unlink(oldPath, () => {});
  }

  user.resume = { url: null, filename: null, originalName: null, uploadedAt: null };
  await user.save();

  res.status(200).json({ success: true, message: 'Resume removed' });
});

// @desc    Upload / replace avatar
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded');
  }

  const user = await User.findById(req.user._id);

  if (user.avatar && user.avatar.filename) {
    const oldPath = path.join(__dirname, '..', 'uploads', 'avatars', user.avatar.filename);
    fs.unlink(oldPath, () => {});
  }

  user.avatar = {
    url: `/uploads/avatars/${req.file.filename}`,
    filename: req.file.filename
  };
  await user.save();

  res.status(200).json({ success: true, avatar: user.avatar });
});

// @desc    Get a public jobseeker profile (for recruiters reviewing applicants)
// @route   GET /api/users/:id
// @access  Private (recruiter)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Deactivate own account
// @route   DELETE /api/users/profile
// @access  Private
const deactivateAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  res.cookie('token', 'none', { expires: new Date(Date.now() + 5 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Account deactivated' });
});

module.exports = {
  updateProfile,
  uploadResume,
  deleteResume,
  uploadAvatar,
  getUserById,
  deactivateAccount
};
