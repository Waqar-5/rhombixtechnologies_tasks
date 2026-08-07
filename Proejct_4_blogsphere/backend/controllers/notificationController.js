const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');

/**
 * @desc    Get the current user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Notification.find({ recipient: req.user._id }), req.query)
    .sort()
    .paginate();

  features.query = features.query.populate('sender', 'name avatar');

  const [notifications, meta, unreadCount] = await Promise.all([
    features.query,
    features.countTotal(Notification),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  sendResponse(res, 200, 'Notifications fetched', { notifications, unreadCount }, meta);
});

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) throw ApiError.notFound('Notification not found');

  notification.isRead = true;
  await notification.save();

  sendResponse(res, 200, 'Notification marked as read', { notification });
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  sendResponse(res, 200, 'All notifications marked as read');
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  if (!notification) throw ApiError.notFound('Notification not found');
  sendResponse(res, 200, 'Notification deleted');
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification };
