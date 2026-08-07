const mongoose = require('mongoose');

/**
 * Separate collection (rather than an array on Blog) so likes scale
 * independently of blog document size and we can query "did user X like
 * blog Y" in O(1) via the compound unique index below.
 */
const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, blog: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
