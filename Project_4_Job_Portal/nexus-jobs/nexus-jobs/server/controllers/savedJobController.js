const asyncHandler = require('express-async-handler');
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// @desc    Save a job for later
// @route   POST /api/saved-jobs/:jobId
// @access  Private (jobseeker)
const saveJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const existing = await SavedJob.findOne({ user: req.user._id, job: job._id });
  if (existing) {
    res.status(200).json({ success: true, message: 'Already saved', saved: true });
    return;
  }

  await SavedJob.create({ user: req.user._id, job: job._id });
  res.status(201).json({ success: true, message: 'Job saved', saved: true });
});

// @desc    Unsave a job
// @route   DELETE /api/saved-jobs/:jobId
// @access  Private (jobseeker)
const unsaveJob = asyncHandler(async (req, res) => {
  await SavedJob.findOneAndDelete({ user: req.user._id, job: req.params.jobId });
  res.status(200).json({ success: true, message: 'Job removed from saved list', saved: false });
});

// @desc    Get logged-in user's saved jobs
// @route   GET /api/saved-jobs
// @access  Private (jobseeker)
const getSavedJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [savedJobs, total] = await Promise.all([
    SavedJob.find({ user: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: 'job',
        populate: [
          { path: 'company', select: 'name slug logo' },
          { path: 'category', select: 'name slug' }
        ]
      }),
    SavedJob.countDocuments({ user: req.user._id })
  ]);

  // Filter out saves whose job was deleted
  const cleaned = savedJobs.filter((s) => s.job);

  res.status(200).json({
    success: true,
    savedJobs: cleaned,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  });
});

module.exports = { saveJob, unsaveJob, getSavedJobs };
