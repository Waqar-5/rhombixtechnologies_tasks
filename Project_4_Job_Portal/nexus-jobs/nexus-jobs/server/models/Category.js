const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 60 },
    slug: { type: String, unique: true },
    icon: { type: String, trim: true, default: 'Briefcase' } // lucide-react icon name
  },
  { timestamps: true }
);

categorySchema.pre('validate', function generateSlug(next) {
  if (this.name && (this.isModified('name') || !this.slug)) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
