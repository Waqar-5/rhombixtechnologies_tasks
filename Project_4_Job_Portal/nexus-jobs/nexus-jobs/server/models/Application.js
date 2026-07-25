const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    // Snapshot of the resume on file at time of application, so later
    // resume changes on the profile don't rewrite what was submitted.
    resumeSnapshot: {
      url: { type: String, required: true },
      filename: { type: String, required: true },
      originalName: { type: String }
    },
    coverNote: { type: String, trim: true, maxlength: 1500, default: '' },
    status: {
      type: String,
      enum: ['applied', 'in-review', 'shortlisted', 'interview', 'rejected', 'hired'],
      default: 'applied'
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String
      }
    ],
    recruiterNotes: { type: String, trim: true, maxlength: 2000, default: '' }
  },
  { timestamps: true }
);

// One application per job seeker, per job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ company: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
