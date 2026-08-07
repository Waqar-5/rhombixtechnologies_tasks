const asyncHandler = require('express-async-handler');
const Like = require('../models/Like');
const Blog = require('../models/Blog');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/apiResponse');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Like or unlike a blog (toggle)
 * @route   POST /api/blogs/:blogId/like
 * @access  Private
 */
const toggleLike = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) throw ApiError.notFound('Blog not found');

  const existing = await Like.findOne({ user: req.user._id, blog: blog._id });

  let liked;
  if (existing) {
    await existing.deleteOne();
    blog.likesCount = Math.max(0, blog.likesCount - 1);
    liked = false;
  } else {
    await Like.create({ user: req.user._id, blog: blog._id });
    blog.likesCount += 1;
    liked = true;

    await createNotification({
      recipient: blog.author,
      sender: req.user._id,
      type: 'blog_liked',
      message: `${req.user.name} liked your post "${blog.title}"`,
      link: `/blogs/${blog.slug}`,
      relatedBlog: blog._id,
    });
  }

  await blog.save();

  sendResponse(res, 200, liked ? 'Blog liked' : 'Blog unliked', {
    liked,
    likesCount: blog.likesCount,
  });
});

/**
 * @desc    Get all users who liked a blog
 * @route   GET /api/blogs/:blogId/likes
 * @access  Public
 */
const getBlogLikers = asyncHandler(async (req, res) => {
  const likes = await Like.find({ blog: req.params.blogId }).populate('user', 'name avatar');
  sendResponse(res, 200, 'Likes fetched', { users: likes.map((l) => l.user) });
});

module.exports = { toggleLike, getBlogLikers };
