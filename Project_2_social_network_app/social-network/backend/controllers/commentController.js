const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { createNotification } = require('../utils/notify');

// @desc    Add a comment (or reply) to a post
// @route   POST /api/comments/:postId
const addComment = async (req, res, next) => {
  try {
    const { text, parentComment } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      text,
      parentComment: parentComment || null,
    });

    post.comments.push(comment._id);
    await post.save();

    const populated = await Comment.findById(comment._id).populate('author', 'name username avatar');

    const io = req.app.get('io');

    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (parent) {
        await createNotification({
          io,
          recipientId: parent.author,
          senderId: req.user._id,
          type: 'reply_comment',
          postId: post._id,
          commentId: comment._id,
          message: `${req.user.name} replied to your comment.`,
        });
      }
    } else {
      await createNotification({
        io,
        recipientId: post.author,
        senderId: req.user._id,
        type: 'comment_post',
        postId: post._id,
        commentId: comment._id,
        message: `${req.user.name} commented on your post.`,
      });
    }

    io.emit('comment:new', { postId: post._id, comment: populated });

    res.status(201).json({ comment: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all comments for a post (threaded)
// @route   GET /api/comments/:postId
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name username avatar')
      .sort({ createdAt: 1 });
    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

// @desc    Like/unlike a comment (toggle)
// @route   PUT /api/comments/:commentId/like
const toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const userId = req.user._id;
    const alreadyLiked = comment.likes.some((id) => String(id) === String(userId));

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => String(id) !== String(userId));
    } else {
      comment.likes.push(userId);
    }
    await comment.save();

    const io = req.app.get('io');

    if (!alreadyLiked) {
      await createNotification({
        io,
        recipientId: comment.author,
        senderId: userId,
        type: 'like_comment',
        postId: comment.post,
        commentId: comment._id,
        message: `${req.user.name} liked your comment.`,
      });
    }

    io.emit('comment:liked', { commentId: comment._id, likes: comment.likes });

    res.json({ likes: comment.likes, liked: !alreadyLiked });
  } catch (err) {
    next(err);
  }
};

// @desc    Edit own comment
// @route   PUT /api/comments/:commentId
const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    if (String(comment.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own comments.' });
    }

    comment.text = req.body.text;
    comment.isEdited = true;
    await comment.save();

    res.json({ comment });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete own comment
// @route   DELETE /api/comments/:commentId
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const post = await Post.findById(comment.post);
    const isCommentAuthor = String(comment.author) === String(req.user._id);
    const isPostAuthor = post && String(post.author) === String(req.user._id);

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'Not authorized to delete this comment.' });
    }

    await Comment.deleteMany({ $or: [{ _id: comment._id }, { parentComment: comment._id }] });

    if (post) {
      post.comments = post.comments.filter((c) => String(c) !== String(comment._id));
      await post.save();
    }

    const io = req.app.get('io');
    io.emit('comment:deleted', { postId: comment.post, commentId: comment._id });

    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { addComment, getComments, toggleCommentLike, editComment, deleteComment };
