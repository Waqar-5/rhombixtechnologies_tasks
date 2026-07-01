const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const Post = require('../models/Post');

/**
 * Determines what a viewer is allowed to see on a target user's profile
 * based on the target's privacy settings and the relationship between them.
 */
const getRelationship = (targetUser, viewerId) => {
  if (!viewerId) return 'stranger';
  if (String(targetUser._id) === String(viewerId)) return 'self';
  const isFriend = targetUser.friends.some((f) => String(f) === String(viewerId));
  return isFriend ? 'friend' : 'stranger';
};

const canView = (visibilitySetting, relationship) => {
  if (relationship === 'self') return true;
  if (visibilitySetting === 'public') return true;
  if (visibilitySetting === 'friends') return relationship === 'friend';
  return false; // private
};

// @desc    Get a user's public profile by username
// @route   GET /api/users/:username
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).populate(
      'friends',
      'name username avatar'
    );

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const viewerId = req.user ? req.user._id : null;
    const relationship = getRelationship(user, viewerId);

    if (!canView(user.privacy.profileVisibility, relationship)) {
      return res.status(403).json({
        message: 'This profile is private.',
        limited: true,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
        },
      });
    }

    const safeUser = user.toSafeObject();

    if (!canView(user.privacy.friendsListVisibility, relationship)) {
      safeUser.friends = [];
      safeUser.friendsHidden = true;
    }

    let friendStatus = 'none';
    if (viewerId && relationship !== 'self') {
      if (relationship === 'friend') {
        friendStatus = 'friends';
      } else {
        const pending = await FriendRequest.findOne({
          $or: [
            { sender: viewerId, recipient: user._id, status: 'pending' },
            { sender: user._id, recipient: viewerId, status: 'pending' },
          ],
        });
        if (pending) {
          friendStatus = String(pending.sender) === String(viewerId) ? 'request_sent' : 'request_received';
        }
      }
    }

    res.json({ user: safeUser, relationship, friendStatus });
  } catch (err) {
    next(err);
  }
};

// @desc    Update own profile
// @route   PUT /api/users/me
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'bio', 'location', 'website'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload/update avatar
// @route   POST /api/users/me/avatar
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });

    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload/update cover photo
// @route   POST /api/users/me/cover
const updateCoverPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const coverUrl = `/uploads/covers/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { coverPhoto: coverUrl }, { new: true });

    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    Update privacy settings
// @route   PUT /api/users/me/privacy
const updatePrivacy = async (req, res, next) => {
  try {
    const allowedKeys = [
      'profileVisibility',
      'friendsListVisibility',
      'whoCanMessage',
      'whoCanPostOnTimeline',
      'showOnlineStatus',
    ];
    const updates = {};
    allowedKeys.forEach((key) => {
      if (req.body[key] !== undefined) updates[`privacy.${key}`] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });

    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    Search users by name/username
// @route   GET /api/users/search?q=...
const searchUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ users: [] });

    const users = await User.find({
      $or: [{ name: { $regex: q, $options: 'i' } }, { username: { $regex: q, $options: 'i' } }],
    })
      .limit(15)
      .select('name username avatar bio');

    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// @desc    Get suggested users (not already friends, not self, no pending request)
// @route   GET /api/users/suggestions
const getSuggestions = async (req, res, next) => {
  try {
    const me = await User.findById(req.user._id);
    const pendingRequests = await FriendRequest.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
      status: 'pending',
    });

    const excludeIds = new Set([
      String(req.user._id),
      ...me.friends.map(String),
      ...pendingRequests.map((r) => String(r.sender)),
      ...pendingRequests.map((r) => String(r.recipient)),
    ]);

    const suggestions = await User.find({ _id: { $nin: Array.from(excludeIds) } })
      .limit(8)
      .select('name username avatar bio');

    res.json({ users: suggestions });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a user's friends list (respects privacy)
// @route   GET /api/users/:username/friends
const getUserFriends = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).populate(
      'friends',
      'name username avatar bio'
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const viewerId = req.user ? req.user._id : null;
    const relationship = getRelationship(user, viewerId);

    if (!canView(user.privacy.friendsListVisibility, relationship)) {
      return res.status(403).json({ message: 'This friends list is private.' });
    }

    res.json({ friends: user.friends });
  } catch (err) {
    next(err);
  }
};

// @desc    Get posts saved/bookmarked by the current user
// @route   GET /api/users/me/saved
const getSavedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: { path: 'author', select: 'name username avatar' },
      options: { sort: { createdAt: -1 } },
    });
    res.json({ posts: user.savedPosts });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  updateAvatar,
  updateCoverPhoto,
  updatePrivacy,
  searchUsers,
  getSuggestions,
  getUserFriends,
  getSavedPosts,
  canView,
  getRelationship,
};
