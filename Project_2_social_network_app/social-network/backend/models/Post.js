const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: '',
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    shares: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
    },
    feeling: {
      type: String,
      maxlength: 50,
      default: '',
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ text: 'text' });

module.exports = mongoose.model('Post', postSchema);
