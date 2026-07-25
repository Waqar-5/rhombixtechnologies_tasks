const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const Company = require('../models/Company');
const Job = require('../models/Job');

// @desc    List companies (with basic search + pagination)
// @route   GET /api/companies
// @access  Public
const getCompanies = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12, industry } = req.query;
  const filter = {};
  if (q) filter.name = new RegExp(q, 'i');
  if (industry && industry !== 'all') filter.industry = industry;

  const skip = (Number(page) - 1) * Number(limit);

  const [companies, total] = await Promise.all([
    Company.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).populate('jobCount'),
    Company.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    companies,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  });
});

// @desc    Get single company profile by slug, with its open jobs
// @route   GET /api/companies/:slug
// @access  Public
const getCompanyBySlug = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ slug: req.params.slug }).populate('jobCount');
  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  const jobs = await Job.find({ company: company._id, status: 'open' })
    .sort('-createdAt')
    .populate('category', 'name slug icon');

  res.status(200).json({ success: true, company, jobs });
});

// @desc    Get the logged-in recruiter's own company
// @route   GET /api/companies/me
// @access  Private (recruiter)
const getMyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user._id });
  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }
  res.status(200).json({ success: true, company });
});

// @desc    Update the logged-in recruiter's company profile
// @route   PUT /api/companies/me
// @access  Private (recruiter)
const updateMyCompany = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'tagline',
    'description',
    'industry',
    'companySize',
    'founded',
    'website',
    'headquarters',
    'socialLinks',
    'perks'
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const company = await Company.findOneAndUpdate({ owner: req.user._id }, updates, {
    new: true,
    runValidators: true
  });

  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }

  res.status(200).json({ success: true, company });
});

// @desc    Upload / replace company logo
// @route   POST /api/companies/me/logo
// @access  Private (recruiter)
const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded');
  }

  const company = await Company.findOne({ owner: req.user._id });
  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }

  if (company.logo && company.logo.filename) {
    const oldPath = path.join(__dirname, '..', 'uploads', 'logos', company.logo.filename);
    fs.unlink(oldPath, () => {});
  }

  company.logo = { url: `/uploads/logos/${req.file.filename}`, filename: req.file.filename };
  await company.save();

  res.status(200).json({ success: true, logo: company.logo });
});

// @desc    Upload / replace company cover image
// @route   POST /api/companies/me/cover
// @access  Private (recruiter)
const uploadCover = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded');
  }

  const company = await Company.findOne({ owner: req.user._id });
  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }

  if (company.coverImage && company.coverImage.filename) {
    const oldPath = path.join(__dirname, '..', 'uploads', 'logos', company.coverImage.filename);
    fs.unlink(oldPath, () => {});
  }

  company.coverImage = { url: `/uploads/logos/${req.file.filename}`, filename: req.file.filename };
  await company.save();

  res.status(200).json({ success: true, coverImage: company.coverImage });
});

module.exports = {
  getCompanies,
  getCompanyBySlug,
  getMyCompany,
  updateMyCompany,
  uploadLogo,
  uploadCover
};
