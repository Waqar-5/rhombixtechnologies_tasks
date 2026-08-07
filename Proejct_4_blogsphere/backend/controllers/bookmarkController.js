const asyncHandler = require('express-async-handler');
const Bookmark = require('../models/Bookmark');
const Blog = require('../models/Blog');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');

/**
 * @desc    Bookmark or unbookmark a blog (toggle)
 * @route   POST /api/blogs/:blogId/bookmark
 * @access  Private
 */
const toggleBookmark = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) throw ApiError.notFound('Blog not found');

  const existing = await Bookmark.findOne({ user: req.user._id, blog: blog._id });

  let bookmarked;
  if (existing) {
    await existing.deleteOne();
    bookmarked = false;
  } else {
    await Bookmark.create({ user: req.user._id, blog: blog._id });
    bookmarked = true;
  }

  sendResponse(res, 200, bookmarked ? 'Blog bookmarked' : 'Bookmark removed', { bookmarked });
});

/**
 * @desc    Get the current user's bookmarked blogs
 * @route   GET /api/bookmarks
 * @access  Private
 */
const getMyBookmarks = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Bookmark.find({ user: req.user._id }), req.query)
    .sort()
    .paginate();

  features.query = features.query.populate({
    path: 'blog',
    populate: [
      { path: 'author', select: 'name avatar' },
      { path: 'category', select: 'name slug' },
    ],
  });

  const [bookmarks, meta] = await Promise.all([features.query, features.countTotal(Bookmark)]);

  // Filter out bookmarks whose blog was since deleted, rather than crashing on null refs.
  const blogs = bookmarks.filter((b) => b.blog).map((b) => b.blog);

  sendResponse(res, 200, 'Bookmarks fetched', { blogs }, meta);
});

module.exports = { toggleBookmark, getMyBookmarks };
