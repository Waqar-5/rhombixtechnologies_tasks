const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  },
  { timestamps: true }
);

// Prevents a user from bookmarking the same blog twice and gives us a
// fast existence check for "is this bookmarked?" on blog detail pages.
bookmarkSchema.index({ user: 1, blog: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
