const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 120
    },
    slug: { type: String, index: true },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: 8000
    },
    responsibilities: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    niceToHave: [{ type: String, trim: true }],
    benefits: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      required: true
    },
    workMode: {
      type: String,
      enum: ['on-site', 'remote', 'hybrid'],
      required: true
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior', 'lead'],
      required: true
    },
    location: { type: String, trim: true, required: true },
    salary: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      currency: { type: String, default: 'USD' },
      isPublic: { type: Boolean, default: true }
    },
    vacancies: { type: Number, default: 1, min: 1 },
    applicationDeadline: { type: Date },
    // Jobs publish instantly on creation - no admin moderation step.
    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open'
    },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ jobType: 1, workMode: 1, experienceLevel: 1 });

jobSchema.pre('validate', function generateSlug(next) {
  if (this.title && (this.isModified('title') || !this.slug)) {
    const base = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    this.slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
  }
  next();
});

jobSchema.virtual('isExpired').get(function isExpired() {
  return this.applicationDeadline ? this.applicationDeadline < new Date() : false;
});

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
