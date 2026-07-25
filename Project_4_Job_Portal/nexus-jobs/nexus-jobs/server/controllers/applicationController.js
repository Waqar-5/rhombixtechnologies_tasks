const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');
const createNotification = require('../utils/createNotification');

// @desc    Apply to a job - one click using the resume already on file,
//          with an optional short cover note.
// @route   POST /api/applications/:jobId
// @access  Private (jobseeker)
const applyToJob = asyncHandler(async (req, res) => {
  const { coverNote } = req.body;

  const job = await Job.findById(req.params.jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.status !== 'open') {
    res.status(400);
    throw new Error('This job is no longer accepting applications');
  }

  if (job.applicationDeadline && job.applicationDeadline < new Date()) {
    res.status(400);
    throw new Error('The application deadline for this job has passed');
  }

  if (!req.user.resume || !req.user.resume.url) {
    res.status(400);
    throw new Error('Upload a resume to your profile before applying');
  }

  const existing = await Application.findOne({ job: job._id, applicant: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already applied to this job');
  }

  const application = await Application.create({
    job: job._id,
    applicant: req.user._id,
    company: job.company,
    resumeSnapshot: {
      url: req.user.resume.url,
      filename: req.user.resume.filename,
      originalName: req.user.resume.originalName
    },
    coverNote: coverNote || '',
    statusHistory: [{ status: 'applied', note: 'Application submitted' }]
  });

  job.applicationsCount += 1;
  await job.save();

  await createNotification({
    recipient: job.recruiter,
    type: 'application_received',
    title: 'New application received',
    message: `${req.user.name} applied for ${job.title}`,
    link: `/recruiter/jobs/${job._id}/applicants`,
    relatedJob: job._id,
    relatedApplication: application._id
  });

  res.status(201).json({ success: true, application });
});

// @desc    Withdraw an application
// @route   DELETE /api/applications/:id
// @access  Private (jobseeker, owner)
const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.applicant.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not have permission to withdraw this application');
  }

  await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });
  await application.deleteOne();

  res.status(200).json({ success: true, message: 'Application withdrawn' });
});

// @desc    Get logged-in jobseeker's applications
// @route   GET /api/applications/mine
// @access  Private (jobseeker)
const getMyApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { applicant: req.user._id };
  if (status && status !== 'all') filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: 'job',
        select: 'title slug location jobType workMode status',
        populate: { path: 'company', select: 'name slug logo' }
      }),
    Application.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    applications,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  });
});

// @desc    Get applicants for a specific job (recruiter view)
// @route   GET /api/applications/job/:jobId
// @access  Private (recruiter, job owner)
const getJobApplicants = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not have permission to view these applicants');
  }

  const { status, page = 1, limit = 20 } = req.query;
  const filter = { job: job._id };
  if (status && status !== 'all') filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('applicant', 'name email avatar headline location skills resume'),
    Application.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    job: { _id: job._id, title: job.title },
    applications,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  });
});

// @desc    Get all applicants across the recruiter's jobs
// @route   GET /api/applications/recruiter/all
// @access  Private (recruiter)
const getAllApplicantsForRecruiter = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const jobs = await Job.find({ recruiter: req.user._id }).select('_id');
  const jobIds = jobs.map((j) => j._id);

  const filter = { job: { $in: jobIds } };
  if (status && status !== 'all') filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('applicant', 'name email avatar headline location')
      .populate('job', 'title slug'),
    Application.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    applications,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  });
});

// @desc    Update application status (recruiter reviewing pipeline)
// @route   PUT /api/applications/:id/status
// @access  Private (recruiter, job owner)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['applied', 'in-review', 'shortlisted', 'interview', 'rejected', 'hired'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid application status');
  }

  const application = await Application.findById(req.params.id).populate('job');
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not have permission to update this application');
  }

  application.status = status;
  application.statusHistory.push({ status, note: note || '' });
  await application.save();

  await createNotification({
    recipient: application.applicant,
    type: 'application_status_changed',
    title: 'Your application status changed',
    message: `Your application for ${application.job.title} is now "${status.replace('-', ' ')}"`,
    link: `/seeker/applications`,
    relatedJob: application.job._id,
    relatedApplication: application._id
  });

  res.status(200).json({ success: true, application });
});

// @desc    Get single application detail (recruiter, job owner)
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('applicant', 'name email avatar headline location skills resume bio experience education socialLinks')
    .populate('job', 'title slug recruiter');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const isOwnerApplicant = application.applicant._id.toString() === req.user._id.toString();
  const isOwnerRecruiter = application.job.recruiter.toString() === req.user._id.toString();

  if (!isOwnerApplicant && !isOwnerRecruiter) {
    res.status(403);
    throw new Error('You do not have permission to view this application');
  }

  res.status(200).json({ success: true, application });
});

module.exports = {
  applyToJob,
  withdrawApplication,
  getMyApplications,
  getJobApplicants,
  getAllApplicantsForRecruiter,
  updateApplicationStatus,
  getApplicationById
};
