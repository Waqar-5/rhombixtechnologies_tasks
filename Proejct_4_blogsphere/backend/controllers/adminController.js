const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Bookmark = require('../models/Bookmark');
const Like = require('../models/Like');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');
const { deleteFromDisk } = require('../utils/fileStorage');
const { createNotification } = require('../services/notificationService');
const emailService = require('../services/emailService');
const config = require('../config/env');

/**
 * @desc    Get admin dashboard summary cards + recent activity
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBlogs,
    publishedBlogs,
    draftBlogs,
    pendingBlogs,
    totalComments,
    totalCategories,
    totalTags,
    viewsAndLikes,
    recentUsers,
    recentBlogs,
    recentComments,
  ] = await Promise.all([
    User.countDocuments(),
    Blog.countDocuments(),
    Blog.countDocuments({ status: 'published' }),
    Blog.countDocuments({ status: 'draft' }),
    Blog.countDocuments({ status: 'pending' }),
    Comment.countDocuments(),
    Category.countDocuments(),
    Tag.countDocuments(),
    Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' }, totalLikes: { $sum: '$likesCount' } } },
    ]),
    User.find().sort('-createdAt').limit(5).select('name email avatar role createdAt'),
    Blog.find().sort('-createdAt').limit(5).populate('author', 'name').select('title status views createdAt author'),
    Comment.find().sort('-createdAt').limit(5).populate('author', 'name').populate('blog', 'title slug'),
  ]);

  sendResponse(res, 200, 'Dashboard data fetched', {
    cards: {
      totalUsers,
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      pendingBlogs,
      totalComments,
      totalCategories,
      totalTags,
      totalViews: viewsAndLikes[0]?.totalViews || 0,
      totalLikes: viewsAndLikes[0]?.totalLikes || 0,
    },
    recentUsers,
    recentBlogs,
    recentComments,
  });
});

// ==========================================================
// USER MANAGEMENT
// ==========================================================

/**
 * @desc    Get all users (search/filter/paginate)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .search(['name', 'email'])
    .sort()
    .limitFields()
    .paginate();

  const [users, meta] = await Promise.all([features.query, features.countTotal(User)]);
  sendResponse(res, 200, 'Users fetched', { users }, meta);
});

/**
 * @desc    Update a user's role or block status
 * @route   PATCH /api/admin/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot modify your own admin account through this endpoint');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const { role, isBlocked } = req.body;
  if (role !== undefined) {
    if (!['user', 'admin'].includes(role)) throw ApiError.badRequest('Invalid role');
    user.role = role;
  }
  if (isBlocked !== undefined) {
    user.isBlocked = Boolean(isBlocked);
    if (user.isBlocked) user.refreshTokenHash = undefined; // force logout
  }

  await user.save();
  sendResponse(res, 200, 'User updated successfully', { user });
});

/**
 * @desc    Block a user
 * @route   PATCH /api/admin/users/:id/block
 * @access  Private/Admin
 */
const blockUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot block your own account');
  }
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.isBlocked = true;
  user.refreshTokenHash = undefined;
  await user.save();

  sendResponse(res, 200, 'User blocked successfully', { user });
});

/**
 * @desc    Unblock a user
 * @route   PATCH /api/admin/users/:id/unblock
 * @access  Private/Admin
 */
const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.isBlocked = false;
  await user.save();

  sendResponse(res, 200, 'User unblocked successfully', { user });
});

/**
 * @desc    Delete a user and cascade-delete their content
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot delete your own admin account');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const userBlogs = await Blog.find({ author: user._id });
  const blogIds = userBlogs.map((b) => b._id);

  const imagesToDelete = [
    ...(user.avatar?.publicId ? [user.avatar.publicId] : []),
    ...userBlogs.flatMap((b) => [
      b.coverImage?.publicId,
      ...b.images.map((img) => img.publicId),
    ].filter(Boolean)),
  ];
  imagesToDelete.forEach((id) => deleteFromDisk(id));

  await Promise.all([
    Blog.deleteMany({ author: user._id }),
    Comment.deleteMany({ $or: [{ author: user._id }, { blog: { $in: blogIds } }] }),
    Like.deleteMany({ $or: [{ user: user._id }, { blog: { $in: blogIds } }] }),
    Bookmark.deleteMany({ $or: [{ user: user._id }, { blog: { $in: blogIds } }] }),
  ]);

  await user.deleteOne();

  sendResponse(res, 200, 'User and all associated content deleted successfully');
});

// ==========================================================
// BLOG MANAGEMENT
// ==========================================================

/**
 * @desc    Get all blogs regardless of status (admin view)
 * @route   GET /api/admin/blogs
 * @access  Private/Admin
 */
const getAllBlogsAdmin = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Blog.find(), req.query)
    .filter()
    .search(['title', 'excerpt'])
    .sort()
    .limitFields()
    .paginate();

  features.query = features.query.populate('author', 'name email').populate('category', 'name slug');

  const [blogs, meta] = await Promise.all([features.query, features.countTotal(Blog)]);
  sendResponse(res, 200, 'Blogs fetched', { blogs }, meta);
});

/**
 * @desc    Toggle a blog's featured status
 * @route   PATCH /api/admin/blogs/:id/feature
 * @access  Private/Admin
 */
const toggleFeatureBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound('Blog not found');

  blog.isFeatured = !blog.isFeatured;
  await blog.save();

  if (blog.isFeatured) {
    await createNotification({
      recipient: blog.author,
      type: 'blog_featured',
      message: `Your post "${blog.title}" has been featured!`,
      link: `/blogs/${blog.slug}`,
      relatedBlog: blog._id,
    });
  }

  sendResponse(res, 200, `Blog ${blog.isFeatured ? 'featured' : 'unfeatured'} successfully`, { blog });
});

/**
 * @desc    Approve a pending blog for publication
 * @route   PATCH /api/admin/blogs/:id/approve
 * @access  Private/Admin
 */
const approveBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('author', 'name email');
  if (!blog) throw ApiError.notFound('Blog not found');

  blog.status = 'published';
  await blog.save();

  await createNotification({
    recipient: blog.author._id,
    type: 'blog_approved',
    message: `Your post "${blog.title}" was approved and is now live!`,
    link: `/blogs/${blog.slug}`,
    relatedBlog: blog._id,
  });

  try {
    await emailService.sendBlogPublishedEmail(blog.author, blog.title, `${config.clientUrl}/blogs/${blog.slug}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Failed to send approval email: ${err.message}`);
  }

  sendResponse(res, 200, 'Blog approved and published', { blog });
});

/**
 * @desc    Reject a pending blog
 * @route   PATCH /api/admin/blogs/:id/reject
 * @access  Private/Admin
 */
const rejectBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('author', 'name email');
  if (!blog) throw ApiError.notFound('Blog not found');

  blog.status = 'rejected';
  await blog.save();

  await createNotification({
    recipient: blog.author._id,
    type: 'blog_rejected',
    message: `Your post "${blog.title}" was not approved. ${req.body.reason || ''}`.trim(),
    link: `/dashboard/blogs`,
    relatedBlog: blog._id,
  });

  sendResponse(res, 200, 'Blog rejected', { blog });
});

/**
 * @desc    Admin delete any blog
 * @route   DELETE /api/admin/blogs/:id
 * @access  Private/Admin
 */
const adminDeleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound('Blog not found');

  const imagesToDelete = [
    ...(blog.coverImage?.publicId ? [blog.coverImage.publicId] : []),
    ...blog.images.map((img) => img.publicId).filter(Boolean),
  ];
  imagesToDelete.forEach((id) => deleteFromDisk(id));

  await Promise.all([
    Comment.deleteMany({ blog: blog._id }),
    Like.deleteMany({ blog: blog._id }),
    Bookmark.deleteMany({ blog: blog._id }),
    Category.updateOne({ _id: blog.category }, { $inc: { blogsCount: -1 } }),
    blog.tags.length ? Tag.updateMany({ _id: { $in: blog.tags } }, { $inc: { blogsCount: -1 } }) : Promise.resolve(),
  ]);

  await blog.deleteOne();
  sendResponse(res, 200, 'Blog deleted successfully');
});

// ==========================================================
// COMMENT MODERATION
// ==========================================================

/**
 * @desc    Get all comments (optionally filtered to reported ones)
 * @route   GET /api/admin/comments
 * @access  Private/Admin
 */
const getAllCommentsAdmin = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Comment.find(), req.query)
    .filter()
    .sort()
    .paginate();

  features.query = features.query
    .populate('author', 'name email avatar')
    .populate('blog', 'title slug');

  const [comments, meta] = await Promise.all([features.query, features.countTotal(Comment)]);
  sendResponse(res, 200, 'Comments fetched', { comments }, meta);
});

/**
 * @desc    Hide/unhide a comment
 * @route   PATCH /api/admin/comments/:id/status
 * @access  Private/Admin
 */
const updateCommentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['visible', 'hidden', 'approved', 'rejected'].includes(status)) {
    throw ApiError.badRequest('Invalid status');
  }

  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');

  comment.status = status === 'approved' ? 'visible' : status === 'rejected' ? 'hidden' : status;
  comment.isReported = false; // clears the report flag once moderated
  await comment.save();

  sendResponse(res, 200, 'Comment status updated', { comment });
});

/**
 * @desc    Admin delete any comment
 * @route   DELETE /api/admin/comments/:id
 * @access  Private/Admin
 */
const adminDeleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');

  const replies = await Comment.find({ parentComment: comment._id });
  const deletedCount = 1 + replies.length;

  await Comment.deleteMany({ $or: [{ _id: comment._id }, { parentComment: comment._id }] });
  await Blog.updateOne({ _id: comment.blog }, { $inc: { commentsCount: -deletedCount } });

  sendResponse(res, 200, 'Comment deleted successfully');
});

module.exports = {
  getDashboard,
  getUsers,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
  getAllBlogsAdmin,
  toggleFeatureBlog,
  approveBlog,
  rejectBlog,
  adminDeleteBlog,
  getAllCommentsAdmin,
  updateCommentStatus,
  adminDeleteComment,
};
