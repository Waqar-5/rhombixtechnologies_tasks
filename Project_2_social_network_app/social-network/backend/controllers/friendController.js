const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const { createNotification } = require('../utils/notify');

// @desc    Send a friend request
// @route   POST /api/friends/request/:userId
const sendRequest = async (req, res, next) => {
  try {
    const recipientId = req.params.userId;
    const senderId = req.user._id;

    if (String(recipientId) === String(senderId)) {
      return res.status(400).json({ message: "You can't send a friend request to yourself." });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ message: 'User not found.' });

    const alreadyFriends = recipient.friends.some((f) => String(f) === String(senderId));
    if (alreadyFriends) {
      return res.status(409).json({ message: 'You are already friends.' });
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
      status: 'pending',
    });

    if (existing) {
      return res.status(409).json({ message: 'A pending request already exists between you two.' });
    }

    const request = await FriendRequest.create({ sender: senderId, recipient: recipientId });
    const populated = await FriendRequest.findById(request._id).populate('sender', 'name username avatar');

    const io = req.app.get('io');
    await createNotification({
      io,
      recipientId,
      senderId,
      type: 'friend_request',
      message: `${req.user.name} sent you a friend request.`,
    });

    io.to(`user:${recipientId}`).emit('friendRequest:received', populated);

    res.status(201).json({ request: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept a friend request
// @route   PUT /api/friends/accept/:requestId
const acceptRequest = async (req, res, next) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Friend request not found.' });

    if (String(request.recipient) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You are not authorized to accept this request.' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `This request was already ${request.status}.` });
    }

    request.status = 'accepted';
    await request.save();

    await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.recipient } });
    await User.findByIdAndUpdate(request.recipient, { $addToSet: { friends: request.sender } });

    const io = req.app.get('io');
    await createNotification({
      io,
      recipientId: request.sender,
      senderId: req.user._id,
      type: 'friend_accept',
      message: `${req.user.name} accepted your friend request.`,
    });

    const newFriend = await User.findById(request.sender).select('name username avatar');
    const me = await User.findById(req.user._id).select('name username avatar');

    io.to(`user:${request.sender}`).emit('friend:added', me);
    io.to(`user:${request.recipient}`).emit('friend:added', newFriend);

    res.json({ message: 'Friend request accepted.', request });
  } catch (err) {
    next(err);
  }
};

// @desc    Decline a friend request
// @route   PUT /api/friends/decline/:requestId
const declineRequest = async (req, res, next) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Friend request not found.' });

    if (String(request.recipient) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You are not authorized to decline this request.' });
    }

    request.status = 'declined';
    await request.save();

    res.json({ message: 'Friend request declined.', request });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a sent friend request
// @route   DELETE /api/friends/cancel/:requestId
const cancelRequest = async (req, res, next) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Friend request not found.' });

    if (String(request.sender) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You are not authorized to cancel this request.' });
    }

    await request.deleteOne();
    res.json({ message: 'Friend request canceled.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Unfriend a user
// @route   DELETE /api/friends/:userId
const unfriend = async (req, res, next) => {
  try {
    const { userId } = req.params;

    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { friends: req.user._id } });

    await FriendRequest.deleteMany({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id },
      ],
      status: 'accepted',
    });

    const io = req.app.get('io');
    io.to(`user:${userId}`).emit('friend:removed', { userId: req.user._id });

    res.json({ message: 'Friend removed.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get pending friend requests received by current user
// @route   GET /api/friends/requests/received
const getReceivedRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({ recipient: req.user._id, status: 'pending' })
      .populate('sender', 'name username avatar bio')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    next(err);
  }
};

// @desc    Get pending friend requests sent by current user
// @route   GET /api/friends/requests/sent
const getSentRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({ sender: req.user._id, status: 'pending' })
      .populate('recipient', 'name username avatar bio')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's friends list
// @route   GET /api/friends
const getMyFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name username avatar bio isOnline lastSeen');
    res.json({ friends: user.friends });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  declineRequest,
  cancelRequest,
  unfriend,
  getReceivedRequests,
  getSentRequests,
  getMyFriends,
};
