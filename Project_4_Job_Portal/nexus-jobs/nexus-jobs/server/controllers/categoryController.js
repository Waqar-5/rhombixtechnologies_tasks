const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Job = require('../models/Job');

// @desc    List all categories with open job counts
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');

  const counts = await Job.aggregate([
    { $match: { status: 'open' } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  const countMap = counts.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c.count }), {});

  const withCounts = categories.map((c) => ({
    ...c.toObject(),
    jobCount: countMap[c._id.toString()] || 0
  }));

  res.status(200).json({ success: true, categories: withCounts });
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (recruiter)
const createCategory = asyncHandler(async (req, res) => {
  const { name, icon } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  const exists = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
  if (exists) {
    res.status(200).json({ success: true, category: exists });
    return;
  }

  const category = await Category.create({ name, icon });
  res.status(201).json({ success: true, category });
});

module.exports = { getCategories, createCategory };
