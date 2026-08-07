const mongoose = require('mongoose');
const slugify = require('slugify');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      unique: true,
      trim: true,
      maxlength: [30, 'Tag name cannot exceed 30 characters'],
    },
    slug: { type: String, unique: true, index: true },
    blogsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

tagSchema.pre('validate', function generateSlug(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Tag', tagSchema);
