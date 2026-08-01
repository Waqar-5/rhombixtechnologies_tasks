const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const ApiFeatures = require('../utils/apiFeatures');

// @desc    Public job search with filters, sorting & pagination
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const baseFilter = { status: 'open' };

  const features = new ApiFeatures(
    Job.find(baseFilter).populate('company', 'name slug logo').populate('category', 'name slug'),
    req.query
  )
    .search(['title', 'skills', 'location'])
    .filter({
      jobType: 'jobType',
      workMode: 'workMode',
      experienceLevel: 'experienceLevel',
      category: 'category',
      company: 'company'
    })
    .sort('-isFeatured -createdAt')
    .paginate(12);

  const jobs = await features.query;

  const countFeatures = new ApiFeatures(Job.find(baseFilter), req.query)
    .search(['title', 'skills', 'location'])
    .filter({
      jobType: 'jobType',
      workMode: 'workMode',
      experienceLevel: 'experienceLevel',
      category: 'category',
      company: 'company'
    });
  const total = await Job.countDocuments(countFeatures.query.getFilter());

  res.status(200).json({
    success: true,
    jobs,
    pagination: {
      page: features.pagination.page,
      limit: features.pagination.limit,
      total,
      pages: Math.ceil(total / features.pagination.limit)
    }
  });
});

// @desc    Featured jobs for landing page
// @route   GET /api/jobs/featured
// @access  Public
const getFeaturedJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ status: 'open', isFeatured: true })
    .sort('-createdAt')
    .limit(6)
    .populate('company', 'name slug logo')
    .populate('category', 'name slug');

  res.status(200).json({ success: true, jobs });
});

// @desc    Get single job by slug (increments view count)
// @route   GET /api/jobs/:slug
// @access  Public
const getJobBySlug = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('company')
    .populate('category', 'name slug icon')
    .populate('recruiter', 'name avatar');

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  let hasApplied = false;
  let isSaved = false;

  if (req.user) {
    const [application, saved] = await Promise.all([
      Application.findOne({ job: job._id, applicant: req.user._id }),
      SavedJob.findOne({ job: job._id, user: req.user._id })
    ]);
    hasApplied = Boolean(application);
    isSaved = Boolean(saved);
  }

  res.status(200).json({ success: true, job, hasApplied, isSaved });
});

// @desc    Similar jobs (same category, excluding current)
// @route   GET /api/jobs/:slug/similar
// @access  Public
const getSimilarJobs = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ slug: req.params.slug });
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const similar = await Job.find({
    _id: { $ne: job._id },
    category: job.category,
    status: 'open'
  })
    .limit(4)
    .populate('company', 'name slug logo');

  res.status(200).json({ success: true, jobs: similar });
});

// @desc    Create a job (publishes instantly)
// @route   POST /api/jobs
// @access  Private (recruiter)
const createJob = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user._id });
  if (!company) {
    res.status(400);
    throw new Error('Set up your company profile before posting a job');
  }

  const {
    title,
    category,
    description,
    responsibilities,
    requirements,
    niceToHave,
    benefits,
    skills,
    jobType,
    workMode,
    experienceLevel,
    location,
    salary,
    vacancies,
    applicationDeadline,
    status
  } = req.body;

  if (!title || !category || !description || !jobType || !workMode || !experienceLevel || !location) {
    res.status(400);
    throw new Error('Missing required job fields');
  }

  const job = await Job.create({
    title,
    company: company._id,
    recruiter: req.user._id,
    category,
    description,
    responsibilities,
    requirements,
    niceToHave,
    benefits,
    skills,
    jobType,
    workMode,
    experienceLevel,
    location,
    salary,
    vacancies,
    applicationDeadline,
    status: status === 'draft' ? 'draft' : 'open'
  });

  await job.populate('company', 'name slug logo');
  await job.populate('category', 'name slug');

  res.status(201).json({ success: true, job });
});

// @desc    Update a job (owner recruiter only)
// @route   PUT /api/jobs/:id
// @access  Private (recruiter, owner)
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not have permission to edit this job');
  }

  const allowedFields = [
    'title',
    'category',
    'description',
    'responsibilities',
    'requirements',
    'niceToHave',
    'benefits',
    'skills',
    'jobType',
    'workMode',
    'experienceLevel',
    'location',
    'salary',
    'vacancies',
    'applicationDeadline',
    'status',
    'isFeatured'
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) job[field] = req.body[field];
  });

  await job.save();
  await job.populate('company', 'name slug logo');
  await job.populate('category', 'name slug');

  res.status(200).json({ success: true, job });
});

// @desc    Delete a job (owner recruiter only)
// @route   DELETE /api/jobs/:id
// @access  Private (recruiter, owner)
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not have permission to delete this job');
  }

  await Application.deleteMany({ job: job._id });
  await SavedJob.deleteMany({ job: job._id });
  await job.deleteOne();

  res.status(200).json({ success: true, message: 'Job deleted successfully' });
});

// @desc    Get all jobs posted by the logged-in recruiter
// @route   GET /api/jobs/recruiter/mine
// @access  Private (recruiter)
const getMyJobs = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { recruiter: req.user._id };
  if (status && status !== 'all') filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('category', 'name slug'),
    Job.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    jobs,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  });
});

// @desc    Recruiter dashboard analytics
// @route   GET /api/jobs/recruiter/analytics
// @access  Private (recruiter)
const getRecruiterAnalytics = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user._id });

  const [totalJobs, openJobs, closedJobs, totalApplications, statusBreakdown, jobsWithApps] =
    await Promise.all([
      Job.countDocuments({ recruiter: req.user._id }),
      Job.countDocuments({ recruiter: req.user._id, status: 'open' }),
      Job.countDocuments({ recruiter: req.user._id, status: 'closed' }),
      Application.countDocuments({ company: company?._id }),
      Application.aggregate([
        { $match: { company: company?._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Job.find({ recruiter: req.user._id })
        .sort('-applicationsCount')
        .limit(5)
        .select('title applicationsCount views status')
    ]);

  const breakdown = statusBreakdown.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});

  res.status(200).json({
    success: true,
    analytics: {
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      statusBreakdown: breakdown,
      topJobs: jobsWithApps
    }
  });
});

module.exports = {
  getJobs,
  getFeaturedJobs,
  getJobBySlug,
  getSimilarJobs,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getRecruiterAnalytics
};
