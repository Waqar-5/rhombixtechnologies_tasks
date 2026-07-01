const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { createNotification } = require('../utils/notify');

// @desc    Create a new post (text + optional images/videos)
// @route   POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { text, visibility, feeling } = req.body;

    if (!text && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: 'A post needs text or at least one media file.' });
    }

    const media = (req.files || []).map((file) => {
      const ext = file.originalname.split('.').pop().toLowerCase();
      const isVideo = ['mp4', 'webm', 'mov'].includes(ext);
      return {
        url: `/uploads/posts/${file.filename}`,
        type: isVideo ? 'video' : 'image',
      };
    });

    const post = await Post.create({
      author: req.user._id,
      text: text || '',
      media,
      visibility: visibility || 'public',
      feeling: feeling || '',
    });

    const populated = await Post.findById(post._id).populate('author', 'name username avatar');

    const io = req.app.get('io');
    io.emit('post:new', populated); // broadcast to feed listeners; client filters by relevance

    res.status(201).json({ post: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get personalized feed (own posts + friends' posts, privacy-aware)
// @route   GET /api/posts/feed
const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const me = await User.findById(req.user._id);
    const friendIds = me.friends.map((f) => f.toString());
    const authorPool = [...friendIds, String(req.user._id)];

    // Posts from friends/self at any visibility level they'd allow us to see,
    // plus public posts from anyone else.
    const posts = await Post.find({
      $or: [
        { author: { $in: authorPool }, visibility: { $in: ['public', 'friends'] } },
        { author: req.user._id }, // always see your own, including private
        { visibility: 'public' },
      ],
    })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({
      $or: [
        { author: { $in: authorPool }, visibility: { $in: ['public', 'friends'] } },
        { author: req.user._id },
        { visibility: 'public' },
      ],
    });

    res.json({ posts, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all posts by a specific user (respects visibility + relationship)
// @route   GET /api/posts/user/:userId
const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found.' });

    const viewerId = req.user._id;
    const isSelf = String(userId) === String(viewerId);
    const isFriend = targetUser.friends.some((f) => String(f) === String(viewerId));

    let visibilityFilter = ['public'];
    if (isSelf) visibilityFilter = ['public', 'friends', 'private'];
    else if (isFriend) visibilityFilter = ['public', 'friends'];

    const posts = await Post.find({ author: userId, visibility: { $in: visibilityFilter } })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:postId
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'name username avatar')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name username avatar' },
        options: { sort: { createdAt: -1 } },
      });

    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ post });
  } catch (err) {
    next(err);
  }
};

// @desc    Like or unlike a post (toggle)
// @route   PUT /api/posts/:postId/like
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const userId = req.user._id;
    const alreadyLiked = post.likes.some((id) => String(id) === String(userId));

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => String(id) !== String(userId));
    } else {
      post.likes.push(userId);
    }
    await post.save();

    const io = req.app.get('io');

    if (!alreadyLiked) {
      await createNotification({
        io,
        recipientId: post.author,
        senderId: userId,
        type: 'like_post',
        postId: post._id,
        message: `${req.user.name} liked your post.`,
      });
    }

    io.emit('post:liked', {
      postId: post._id,
      likes: post.likes,
      likedBy: userId,
      liked: !alreadyLiked,
    });

    res.json({ likes: post.likes, liked: !alreadyLiked });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a post (author only)
// @route   DELETE /api/posts/:postId
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    const io = req.app.get('io');
    io.emit('post:deleted', { postId: req.params.postId });

    res.json({ message: 'Post deleted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Edit a post's text/visibility (author only)
// @route   PUT /api/posts/:postId
const editPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own posts.' });
    }

    if (req.body.text !== undefined) post.text = req.body.text;
    if (req.body.visibility !== undefined) post.visibility = req.body.visibility;
    post.isEdited = true;

    await post.save();
    const populated = await Post.findById(post._id).populate('author', 'name username avatar');

    const io = req.app.get('io');
    io.emit('post:updated', populated);

    res.json({ post: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Save/unsave a post (bookmark, toggle)
// @route   PUT /api/posts/:postId/save
const toggleSave = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const postId = req.params.postId;
    const alreadySaved = user.savedPosts.some((id) => String(id) === String(postId));

    if (alreadySaved) {
      user.savedPosts = user.savedPosts.filter((id) => String(id) !== String(postId));
    } else {
      user.savedPosts.push(postId);
    }
    await user.save();

    res.json({ saved: !alreadySaved });
  } catch (err) {
    next(err);
  }
};

// @desc    Share a post (increments share count, broadcasts as a new feed item reference)
// @route   POST /api/posts/:postId/share
const sharePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.postId, { $inc: { shares: 1 } }, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const io = req.app.get('io');
    io.emit('post:shared', { postId: post._id, shares: post.shares });

    res.json({ shares: post.shares });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPost,
  getFeed,
  getUserPosts,
  getPostById,
  toggleLike,
  deletePost,
  editPost,
  toggleSave,
  sharePost,
};
