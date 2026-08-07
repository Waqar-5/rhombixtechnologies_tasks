const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');
const { createNotification } = require('../services/notificationService');
const emailService = require('../services/emailService');
const config = require('../config/env');

const POPULATE_AUTHOR = 'name avatar';

/**
 * @desc    Get top-level comments for a blog, each with its reply count.
 *          Replies are fetched separately (see getReplies) to keep the
 *          initial payload light — most readers never expand every thread.
 * @route   GET /api/blogs/:blogId/comments
 * @access  Public
 */
const getComments = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) throw ApiError.notFound('Blog not found');

  const features = new ApiFeatures(
    Comment.find({ blog: blog._id, parentComment: null, status: 'visible' }),
    req.query
  )
    .sort()
    .paginate();

  features.query = features.query.populate('author', POPULATE_AUTHOR);

  const [comments, meta] = await Promise.all([features.query, features.countTotal(Comment)]);

  // Attach reply counts in one aggregate query rather than N+1 lookups.
  const commentIds = comments.map((c) => c._id);
  const replyCounts = await Comment.aggregate([
    { $match: { parentComment: { $in: commentIds }, status: 'visible' } },
    { $group: { _id: '$parentComment', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(replyCounts.map((r) => [String(r._id), r.count]));

  const enriched = comments.map((c) => ({
    ...c.toObject(),
    repliesCount: countMap[String(c._id)] || 0,
  }));

  sendResponse(res, 200, 'Comments fetched', { comments: enriched }, meta);
});

/**
 * @desc    Get replies to a specific comment
 * @route   GET /api/comments/:commentId/replies
 * @access  Public
 */
const getReplies = asyncHandler(async (req, res) => {
  const parent = await Comment.findById(req.params.commentId);
  if (!parent) throw ApiError.notFound('Comment not found');

  const replies = await Comment.find({ parentComment: parent._id, status: 'visible' })
    .sort('createdAt')
    .populate('author', POPULATE_AUTHOR);

  sendResponse(res, 200, 'Replies fetched', { replies });
});

/**
 * @desc    Add a comment or reply to a blog
 * @route   POST /api/blogs/:blogId/comments
 * @access  Private
 */
const createComment = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.blogId).populate('author', 'name email');
  if (!blog) throw ApiError.notFound('Blog not found');

  const { content, parentComment } = req.body;

  let parent = null;
  if (parentComment) {
    parent = await Comment.findById(parentComment);
    if (!parent || String(parent.blog) !== String(blog._id)) {
      throw ApiError.badRequest('Invalid parent comment');
    }
  }

  const comment = await Comment.create({
    content,
    blog: blog._id,
    author: req.user._id,
    parentComment: parent ? parent._id : null,
  });

  await Blog.updateOne({ _id: blog._id }, { $inc: { commentsCount: 1 } });
  await comment.populate('author', POPULATE_AUTHOR);

  const blogUrl = `${config.clientUrl}/blogs/${blog.slug}`;

  if (parent) {
    // Notify the person being replied to (not the blog author, unless they're the same).
    const parentAuthor = await User.findById(parent.author);
    if (parentAuthor && String(parentAuthor._id) !== String(req.user._id)) {
      await createNotification({
        recipient: parentAuthor._id,
        sender: req.user._id,
        type: 'new_reply',
        message: `${req.user.name} replied to your comment on "${blog.title}"`,
        link: `/blogs/${blog.slug}#comment-${comment._id}`,
        relatedBlog: blog._id,
        relatedComment: comment._id,
      });
      try {
        await emailService.sendNewReplyEmail(parentAuthor, req.user.name, blog.title, blogUrl);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Failed to send reply notification email: ${err.message}`);
      }
    }
  } else if (String(blog.author._id) !== String(req.user._id)) {
    await createNotification({
      recipient: blog.author._id,
      sender: req.user._id,
      type: 'new_comment',
      message: `${req.user.name} commented on "${blog.title}"`,
      link: `/blogs/${blog.slug}#comment-${comment._id}`,
      relatedBlog: blog._id,
      relatedComment: comment._id,
    });
    try {
      await emailService.sendNewCommentEmail(blog.author, req.user.name, blog.title, blogUrl);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Failed to send comment notification email: ${err.message}`);
    }
  }

  sendResponse(res, 201, 'Comment added successfully', { comment });
});

/**
 * @desc    Like or unlike a comment (toggle)
 * @route   POST /api/comments/:id/like
 * @access  Private
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');

  const alreadyLiked = comment.likes.some((id) => String(id) === String(req.user._id));

  if (alreadyLiked) {
    comment.likes.pull(req.user._id);
  } else {
    comment.likes.push(req.user._id);
  }
  comment.likesCount = comment.likes.length;
  await comment.save();

  if (!alreadyLiked && String(comment.author) !== String(req.user._id)) {
    await createNotification({
      recipient: comment.author,
      sender: req.user._id,
      type: 'comment_liked',
      message: `${req.user.name} liked your comment`,
      relatedComment: comment._id,
    });
  }

  sendResponse(res, 200, alreadyLiked ? 'Comment unliked' : 'Comment liked', {
    liked: !alreadyLiked,
    likesCount: comment.likesCount,
  });
});

/**
 * @desc    Delete own comment (or admin deleting any comment)
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');

  const isOwner = String(comment.author) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not have permission to delete this comment');
  }

  // Also remove any replies to this comment to avoid orphaned threads.
  const replies = await Comment.find({ parentComment: comment._id });
  const deletedCount = 1 + replies.length;

  await Comment.deleteMany({ $or: [{ _id: comment._id }, { parentComment: comment._id }] });
  await Blog.updateOne({ _id: comment.blog }, { $inc: { commentsCount: -deletedCount } });

  sendResponse(res, 200, 'Comment deleted successfully');
});

/**
 * @desc    Edit own comment
 * @route   PUT /api/comments/:id
 * @access  Private
 */
const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');

  if (String(comment.author) !== String(req.user._id)) {
    throw ApiError.forbidden('You can only edit your own comments');
  }

  comment.content = req.body.content;
  comment.isEdited = true;
  await comment.save();

  sendResponse(res, 200, 'Comment updated successfully', { comment });
});

/**
 * @desc    Report a comment for moderation
 * @route   POST /api/comments/:id/report
 * @access  Private
 */
const reportComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');

  const alreadyReported = comment.reportReasons.some((r) => String(r.user) === String(req.user._id));
  if (alreadyReported) throw ApiError.badRequest('You have already reported this comment');

  comment.reportReasons.push({ user: req.user._id, reason: req.body.reason });
  comment.isReported = true;
  await comment.save();

  sendResponse(res, 200, 'Comment reported. Our moderators will review it shortly.');
});

module.exports = {
  getComments,
  getReplies,
  createComment,
  toggleCommentLike,
  deleteComment,
  updateComment,
  reportComment,
};
