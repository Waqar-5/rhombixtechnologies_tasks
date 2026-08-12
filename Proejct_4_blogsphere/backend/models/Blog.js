const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      // Not required at the schema level on purpose — a draft can be saved
      // without a category picked yet. Publishing requires one; that rule
      // is enforced in blogController where we know the intended status.
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],

    status: {
      type: String,
      enum: ['draft', 'published', 'pending', 'rejected'],
      default: 'draft',
    },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },

    readingTimeMinutes: { type: Number, default: 1 },

    // --- Engagement (denormalized for fast list/sort queries) ---
    views: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },

    // --- SEO ---
    metaTitle: { type: String, maxlength: 70, default: '' },
    metaDescription: { type: String, maxlength: 160, default: '' },
  },
  { timestamps: true }
);

// --- Indexes for search/filter/sort performance ---
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ views: -1 });
blogSchema.index({ likesCount: -1 });
blogSchema.index({ isFeatured: 1 });

// --- Auto slug + reading time on save ---
blogSchema.pre('validate', function generateSlug(next) {
  // Slugs are generated ONCE, at creation, and never touched again — even
  // if the title is edited later. This keeps a post's URL stable so
  // bookmarks and shared links never break. (Previously this regenerated
  // on every save because Mongoose considers a field "modified" any time
  // it's reassigned, even to its existing value — which the controller
  // does on every update — so the slug was silently changing on every edit.)
  if (this.isNew && !this.slug) {
    const base = slugify(this.title, { lower: true, strict: true }) || 'post';
    // Suffix with a slice of this document's own ObjectId rather than
    // Math.random(). Two documents can never share an _id, so this makes
    // a slug collision structurally impossible instead of merely
    // statistically unlikely.
    this.slug = `${base}-${this._id.toString().slice(-8)}`;
  }
  next();
});

blogSchema.pre('save', function calcReadingTime(next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    // Strip HTML tags from the rich-text content before counting words.
    const plainText = this.content.replace(/<[^>]*>/g, ' ');
    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
    this.readingTimeMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

module.exports = mongoose.model('Blog', blogSchema);
