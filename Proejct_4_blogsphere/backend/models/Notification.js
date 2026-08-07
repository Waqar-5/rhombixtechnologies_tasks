const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // The user who triggered the notification (commenter, replier, liker).
    // Null for system notifications like "welcome" or "password reset".
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'blog_published',
        'new_comment',
        'new_reply',
        'blog_liked',
        'comment_liked',
        'password_reset',
        'welcome',
        'blog_featured',
        'blog_approved',
        'blog_rejected',
      ],
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String, default: '' }, // frontend route to navigate to on click
    relatedBlog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', default: null },
    relatedComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
