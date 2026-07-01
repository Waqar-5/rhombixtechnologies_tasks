const Notification = require('../models/Notification');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username avatar')
      .populate('post', 'text media')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ message: 'Notification deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
