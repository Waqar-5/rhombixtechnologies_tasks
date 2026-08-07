const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Blog = require('../models/Blog');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/apiResponse');
const { saveBufferToDisk, deleteFromDisk } = require('../utils/fileStorage');
const { clearAuthCookies } = require('../utils/tokenUtils');

/**
 * @desc    Update the current user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'bio', 'website', 'github', 'linkedin', 'twitter',
    'location', 'occupation', 'skills',
  ];

  const user = await User.findById(req.user._id);
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = field === 'skills' && typeof req.body.skills === 'string'
        ? JSON.parse(req.body.skills)
        : req.body[field];
    }
  });

  await user.save();
  sendResponse(res, 200, 'Profile updated successfully', { user });
});

/**
 * @desc    Upload/replace the current user's avatar
 * @route   PUT /api/users/avatar
 * @access  Private
 */
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image file provided');

  const user = await User.findById(req.user._id);

  if (user.avatar?.publicId) {
    deleteFromDisk(user.avatar.publicId);
  }

  // Note: Cloudinary previously applied a face-aware 400x400 crop here.
  // Local storage saves the image as uploaded — if you want that
  // resize/crop behavior back, add the `sharp` package and process
  // req.file.buffer before saving.
  const result = saveBufferToDisk(req.file.buffer, 'avatars', req.file.originalname);

  user.avatar = { url: result.url, publicId: result.publicId };
  await user.save();

  sendResponse(res, 200, 'Avatar updated successfully', { user });
});

/**
 * @desc    Get a public author profile by ID, with their published blog stats
 * @route   GET /api/users/:id
 * @access  Public
 */
const getAuthorProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const [publishedCount, totalViews] = await Promise.all([
    Blog.countDocuments({ author: user._id, status: 'published' }),
    Blog.aggregate([
      { $match: { author: user._id, status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ]).then((r) => r[0]?.totalViews || 0),
  ]);

  sendResponse(res, 200, 'Author profile fetched', {
    user,
    stats: { publishedBlogs: publishedCount, totalViews },
  });
});

/**
 * @desc    Delete the current user's own account
 * @route   DELETE /api/users/me
 * @access  Private
 */
const deleteMyAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!req.body.password || !(await user.comparePassword(req.body.password))) {
    throw ApiError.badRequest('Incorrect password. Account deletion requires password confirmation.');
  }

  if (user.avatar?.publicId) deleteFromDisk(user.avatar.publicId);

  // Note: we intentionally do NOT cascade-delete the user's blogs/comments
  // here to preserve content integrity for other readers; that cleanup is
  // an admin-level decision (see adminController.deleteUser for the
  // full cascading version used when an admin removes a bad actor).
  await user.deleteOne();

  clearAuthCookies(res);
  sendResponse(res, 200, 'Your account has been deleted');
});

module.exports = { updateProfile, updateAvatar, getAuthorProfile, deleteMyAccount };
