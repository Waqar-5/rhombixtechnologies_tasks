const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');
const { sanitizeRichText } = require('../utils/sanitizeHtml');
const { saveBufferToDisk, deleteFromDisk } = require('../utils/fileStorage');
const emailService = require('../services/emailService');
const config = require('../config/env');

/**
 * Accepts an array that may contain a mix of existing Tag ObjectIds and
 * brand-new tag names (as typed into a tag-input UI), and resolves it to
 * a clean array of Tag ObjectIds — creating new Tag documents as needed.
 * This is what lets the frontend send free-form tags without a separate
 * "create tag first" round trip.
 */
const resolveTags = async (tagsInput = []) => {
  if (!Array.isArray(tagsInput) || tagsInput.length === 0) return [];

  const resolvedIds = [];
  for (const raw of tagsInput) {
    const value = String(raw).trim();
    if (!value) continue;

    if (mongoose.isValidObjectId(value)) {
      const exists = await Tag.exists({ _id: value });
      if (exists) {
        resolvedIds.push(value);
        continue;
      }
    }

    // Treat as a name — find case-insensitively or create.
    let tag = await Tag.findOne({ name: new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (!tag) {
      tag = await Tag.create({ name: value });
    }
    resolvedIds.push(tag._id);
  }

  // De-duplicate while preserving order.
  return [...new Set(resolvedIds.map(String))];
};

const POPULATE_AUTHOR = 'name avatar bio occupation';

/**
 * @desc    Get blogs with filtering, search, sorting, and pagination.
 *          Public callers only see 'published' blogs; the requesting
 *          user's own drafts/pending posts are never leaked to others.
 * @route   GET /api/blogs
 * @access  Public
 */
const getBlogs = asyncHandler(async (req, res) => {
  const baseFilter = { status: 'published' };

  // Convenience sort shortcuts used by the landing page and filter bar.
  const sortMap = {
    latest: '-publishedAt',
    oldest: 'publishedAt',
    'most-viewed': '-views',
    'most-liked': '-likesCount',
    trending: '-views -likesCount',
  };
  const sortParam = req.query.sort && sortMap[req.query.sort] ? sortMap[req.query.sort] : req.query.sort;

  const queryString = { ...req.query, sort: sortParam };
  delete queryString.category; // handled explicitly below (accepts slug OR id)
  delete queryString.tag;
  delete queryString.author;
  delete queryString.featured;

  let query = Blog.find(baseFilter);

  if (req.query.category) {
    const category = mongoose.isValidObjectId(req.query.category)
      ? await Category.findById(req.query.category)
      : await Category.findOne({ slug: req.query.category });
    if (!category) return sendResponse(res, 200, 'Blogs fetched', { blogs: [] }, { total: 0, page: 1, limit: 10, totalPages: 0 });
    query = query.where('category').equals(category._id);
  }

  if (req.query.tag) {
    const tag = mongoose.isValidObjectId(req.query.tag)
      ? await Tag.findById(req.query.tag)
      : await Tag.findOne({ slug: req.query.tag });
    if (!tag) return sendResponse(res, 200, 'Blogs fetched', { blogs: [] }, { total: 0, page: 1, limit: 10, totalPages: 0 });
    query = query.where('tags').equals(tag._id);
  }

  if (req.query.author) {
    query = query.where('author').equals(req.query.author);
  }

  if (req.query.featured === 'true') {
    query = query.where('isFeatured').equals(true);
  }

  const features = new ApiFeatures(query, queryString)
    .filter()
    .search(['title', 'excerpt', 'content'])
    .sort()
    .limitFields()
    .paginate();

  features.query = features.query
    .populate('author', POPULATE_AUTHOR)
    .populate('category', 'name slug')
    .populate('tags', 'name slug');

  const [blogs, meta] = await Promise.all([features.query, features.countTotal(Blog)]);

  sendResponse(res, 200, 'Blogs fetched', { blogs }, meta);
});

/**
 * @desc    Get a single blog by ID regardless of status — used by the
 *          editor UI so authors can load their own drafts/pending posts
 *          directly instead of paging through my-blogs client-side.
 * @route   GET /api/blogs/id/:id
 * @access  Private (owner or admin only)
 */
const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('tags', 'name slug');

  if (!blog) throw ApiError.notFound('Blog not found');

  const isOwnerOrAdmin =
    String(blog.author) === String(req.user._id) || req.user.role === 'admin';
  if (!isOwnerOrAdmin) throw ApiError.forbidden('You do not have permission to view this blog');

  sendResponse(res, 200, 'Blog fetched', { blog });
});

/**
 * @desc    Get the current user's own blogs (all statuses, incl. drafts)
 * @route   GET /api/blogs/my-blogs
 * @access  Private
 */
const getMyBlogs = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Blog.find({ author: req.user._id }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  features.query = features.query.populate('category', 'name slug').populate('tags', 'name slug');

  const [blogs, meta] = await Promise.all([features.query, features.countTotal(Blog)]);
  sendResponse(res, 200, 'Your blogs fetched', { blogs }, meta);
});

/**
 * @desc    Get a single blog by slug. Increments view count for published
 *          posts, and includes isLikedByMe/isBookmarkedByMe when a user
 *          is authenticated.
 * @route   GET /api/blogs/:slug
 * @access  Public (attachUserIfPresent)
 */
const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug })
    .populate('author', POPULATE_AUTHOR)
    .populate('category', 'name slug')
    .populate('tags', 'name slug');

  if (!blog) throw ApiError.notFound('Blog not found');

  const isOwnerOrAdmin =
    req.user && (String(blog.author._id) === String(req.user._id) || req.user.role === 'admin');

  if (blog.status !== 'published' && !isOwnerOrAdmin) {
    throw ApiError.notFound('Blog not found');
  }

  if (blog.status === 'published') {
    // Fire-and-forget increment — don't block the response on it, but a
    // dangling promise with no .catch() becomes an unhandled rejection
    // (and can crash the whole process, per server.js's handler) if this
    // write ever fails for any reason. Log and swallow instead.
    Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } })
      .exec()
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`Failed to increment view count for blog ${blog._id}: ${err.message}`);
      });
  }

  let isLikedByMe = false;
  let isBookmarkedByMe = false;
  if (req.user) {
    const [like, bookmark] = await Promise.all([
      Like.exists({ user: req.user._id, blog: blog._id }),
      Bookmark.exists({ user: req.user._id, blog: blog._id }),
    ]);
    isLikedByMe = Boolean(like);
    isBookmarkedByMe = Boolean(bookmark);
  }

  sendResponse(res, 200, 'Blog fetched', {
    blog,
    isLikedByMe,
    isBookmarkedByMe,
  });
});

/**
 * @desc    Get related posts (same category, excluding current blog)
 * @route   GET /api/blogs/:slug/related
 * @access  Public
 */
const getRelatedBlogs = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) throw ApiError.notFound('Blog not found');

  const related = await Blog.find({
    _id: { $ne: blog._id },
    category: blog.category,
    status: 'published',
  })
    .sort('-publishedAt')
    .limit(4)
    .populate('author', POPULATE_AUTHOR)
    .populate('category', 'name slug');

  sendResponse(res, 200, 'Related blogs fetched', { blogs: related });
});

/**
 * @desc    Create a new blog post
 * @route   POST /api/blogs
 * @access  Private
 */
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, excerpt, category, tags, status, metaTitle, metaDescription } = req.body;
  const isPublishing = status === 'published' || status === 'pending';

  let categoryDoc = null;
  if (category) {
    categoryDoc = await Category.findById(category);
    if (!categoryDoc) throw ApiError.badRequest('Invalid category');
  } else if (isPublishing) {
    throw ApiError.badRequest('Category is required to publish');
  }

  const tagIds = await resolveTags(typeof tags === 'string' ? JSON.parse(tags) : tags);

  let coverImage = { url: '', publicId: '' };
  const images = [];

  if (req.files?.coverImage?.[0]) {
    const file = req.files.coverImage[0];
    const result = saveBufferToDisk(file.buffer, 'blogs/covers', file.originalname);
    coverImage = { url: result.url, publicId: result.publicId };
  }

  if (req.files?.images?.length) {
    for (const file of req.files.images) {
      const result = saveBufferToDisk(file.buffer, 'blogs/gallery', file.originalname);
      images.push({ url: result.url, publicId: result.publicId });
    }
  }

  const blog = await Blog.create({
    title,
    content: sanitizeRichText(content),
    excerpt,
    category: categoryDoc?._id || null,
    tags: tagIds,
    status: status || 'draft',
    coverImage,
    images,
    author: req.user._id,
    metaTitle,
    metaDescription,
  });

  if (categoryDoc) await Category.updateOne({ _id: categoryDoc._id }, { $inc: { blogsCount: 1 } });
  if (tagIds.length) await Tag.updateMany({ _id: { $in: tagIds } }, { $inc: { blogsCount: 1 } });

  if (blog.status === 'published') {
    try {
      await emailService.sendBlogPublishedEmail(req.user, blog.title, `${config.clientUrl}/blogs/${blog.slug}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Failed to send blog-published email: ${err.message}`);
    }
  }

  sendResponse(res, 201, 'Blog created successfully', { blog });
});

/**
 * @desc    Update a blog post (author or admin only)
 * @route   PUT /api/blogs/:id
 * @access  Private
 */
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound('Blog not found');

  const isOwner = String(blog.author) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not have permission to edit this blog');
  }

  const { title, content, excerpt, category, tags, status, metaTitle, metaDescription } = req.body;
  const wasPublished = blog.status === 'published';

  if (title !== undefined) blog.title = title;
  if (content !== undefined) blog.content = sanitizeRichText(content);
  if (excerpt !== undefined) blog.excerpt = excerpt;
  if (metaTitle !== undefined) blog.metaTitle = metaTitle;
  if (metaDescription !== undefined) blog.metaDescription = metaDescription;

  if (category !== undefined) {
    if (!category) {
      // Empty string/null means "no category selected" — valid for a
      // draft. Clear it out rather than treating '' as an ID to look up.
      if (blog.category) await Category.updateOne({ _id: blog.category }, { $inc: { blogsCount: -1 } });
      blog.category = null;
    } else if (String(category) !== String(blog.category)) {
      const newCategory = await Category.findById(category);
      if (!newCategory) throw ApiError.badRequest('Invalid category');
      if (blog.category) await Category.updateOne({ _id: blog.category }, { $inc: { blogsCount: -1 } });
      await Category.updateOne({ _id: newCategory._id }, { $inc: { blogsCount: 1 } });
      blog.category = newCategory._id;
    }
  }

  if (tags !== undefined) {
    const newTagIds = await resolveTags(typeof tags === 'string' ? JSON.parse(tags) : tags);
    const oldTagIds = blog.tags.map(String);
    const removed = oldTagIds.filter((id) => !newTagIds.includes(id));
    const added = newTagIds.filter((id) => !oldTagIds.includes(id));
    if (removed.length) await Tag.updateMany({ _id: { $in: removed } }, { $inc: { blogsCount: -1 } });
    if (added.length) await Tag.updateMany({ _id: { $in: added } }, { $inc: { blogsCount: 1 } });
    blog.tags = newTagIds;
  }

  // Only owner/admin can change status; non-admin owners can move
  // draft -> pending (submit for review) or keep as draft, but can't
  // self-publish once admin approval is required for their account tier
  // in the future. For now we allow direct publish by the author.
  if (status !== undefined) blog.status = status;

  const isPublishing = blog.status === 'published' || blog.status === 'pending';
  if (isPublishing && !blog.category) {
    throw ApiError.badRequest('Category is required to publish');
  }
  if (isPublishing && (!blog.title || blog.title.trim().length < 5)) {
    throw ApiError.badRequest('Title must be at least 5 characters to publish');
  }

  if (req.files?.coverImage?.[0]) {
    if (blog.coverImage?.publicId) deleteFromDisk(blog.coverImage.publicId);
    const file = req.files.coverImage[0];
    const result = saveBufferToDisk(file.buffer, 'blogs/covers', file.originalname);
    blog.coverImage = { url: result.url, publicId: result.publicId };
  }

  if (req.files?.images?.length) {
    for (const file of req.files.images) {
      const result = saveBufferToDisk(file.buffer, 'blogs/gallery', file.originalname);
      blog.images.push({ url: result.url, publicId: result.publicId });
    }
  }

  await blog.save();

  if (!wasPublished && blog.status === 'published') {
    try {
      const author = isOwner ? req.user : await mongoose.model('User').findById(blog.author);
      await emailService.sendBlogPublishedEmail(author, blog.title, `${config.clientUrl}/blogs/${blog.slug}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Failed to send blog-published email: ${err.message}`);
    }
  }

  sendResponse(res, 200, 'Blog updated successfully', { blog });
});

/**
 * @desc    Delete a blog post (author or admin only) and clean up
 *          all associated images, comments, likes, and bookmarks.
 * @route   DELETE /api/blogs/:id
 * @access  Private
 */
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound('Blog not found');

  const isOwner = String(blog.author) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not have permission to delete this blog');
  }

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

module.exports = {
  getBlogs,
  getMyBlogs,
  getBlogById,
  getBlogBySlug,
  getRelatedBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  resolveTags, // exported for reuse/testing
};
