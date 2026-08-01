const mongoose = require('mongoose');
const slugify = require('slugify');

const companySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // one recruiter owns exactly one company
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 120
    },
    slug: { type: String, unique: true },
    logo: {
      url: { type: String, default: null },
      filename: { type: String, default: null }
    },
    coverImage: {
      url: { type: String, default: null },
      filename: { type: String, default: null }
    },
    tagline: { type: String, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 3000 },
    industry: { type: String, trim: true },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      default: '1-10'
    },
    founded: { type: Number },
    website: { type: String, trim: true },
    headquarters: { type: String, trim: true },
    socialLinks: {
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      facebook: { type: String, trim: true }
    },
    perks: [{ type: String, trim: true }],
    gallery: [
      {
        url: String,
        filename: String
      }
    ],
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

companySchema.pre('validate', function generateSlug(next) {
  if (this.name && (this.isModified('name') || !this.slug)) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;
  }
  next();
});

companySchema.virtual('jobCount', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'company',
  count: true
});

companySchema.set('toJSON', { virtuals: true });
companySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Company', companySchema);
