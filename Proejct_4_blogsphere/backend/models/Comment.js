const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Self-referencing parent for nested replies. Top-level comments have
    // parent = null. We keep replies one level deep in the API layer
    // (flat list + parentComment ref) to avoid unbounded recursive queries.
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['visible', 'hidden', 'pending', 'rejected'],
      default: 'visible',
    },

    isReported: { type: Boolean, default: false },
    reportReasons: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.index({ blog: 1, parentComment: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
