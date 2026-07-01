const Notification = require('../models/Notification');

/**
 * Creates a notification document and immediately emits it to the
 * recipient's socket room (if they're online) for real-time delivery.
 * Never notifies a user about their own action.
 */
const createNotification = async ({ io, recipientId, senderId, type, postId = null, commentId = null, message = '' }) => {
  if (String(recipientId) === String(senderId)) return null;

  const notification = await Notification.create({
    recipient: recipientId,
    sender: senderId,
    type,
    post: postId,
    comment: commentId,
    message,
  });

  const populated = await Notification.findById(notification._id)
    .populate('sender', 'name username avatar')
    .populate('post', 'text media');

  if (io) {
    io.to(`user:${recipientId}`).emit('notification:new', populated);
  }

  return populated;
};

module.exports = { createNotification };
