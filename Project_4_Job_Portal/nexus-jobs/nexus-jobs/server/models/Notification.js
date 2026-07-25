const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'application_received',
        'application_status_changed',
        'job_posted',
        'new_message',
        'system'
      ],
      required: true
    },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, trim: true, maxlength: 500 },
    link: { type: String, trim: true, default: null },
    relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null
    },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
