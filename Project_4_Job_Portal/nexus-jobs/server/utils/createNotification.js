const Notification = require('../models/Notification');

/**
 * Creates a notification document. Failures here are logged but never
 * thrown, so a notification issue never breaks the primary request flow
 * (e.g. submitting an application should still succeed even if the
 * notification write fails).
 */
const createNotification = async ({
  recipient,
  type,
  title,
  message,
  link = null,
  relatedJob = null,
  relatedApplication = null
}) => {
  try {
    await Notification.create({
      recipient,
      type,
      title,
      message,
      link,
      relatedJob,
      relatedApplication
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = createNotification;
