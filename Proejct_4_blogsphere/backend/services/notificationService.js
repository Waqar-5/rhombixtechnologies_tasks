const Notification = require('../models/Notification');

/**
 * Creates an in-app notification. Never throws to the caller — a failure
 * to write a notification should never break the primary action (e.g.
 * posting a comment should succeed even if the notification insert fails).
 */
const createNotification = async ({ recipient, sender = null, type, message, link = '', relatedBlog = null, relatedComment = null }) => {
  try {
    // Don't notify users about their own actions (e.g. liking your own blog).
    if (sender && String(sender) === String(recipient)) return null;

    return await Notification.create({
      recipient,
      sender,
      type,
      message,
      link,
      relatedBlog,
      relatedComment,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to create notification: ${error.message}`);
    return null;
  }
};

module.exports = { createNotification };
