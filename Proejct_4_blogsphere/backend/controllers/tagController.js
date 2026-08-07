const asyncHandler = require('express-async-handler');
const Tag = require('../models/Tag');
const Blog = require('../models/Blog');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');

/**
 * @desc    Get all tags
 * @route   GET /api/tags
 * @access  Public
 */
const getTags = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Tag.find(), req.query)
    .search(['name'])
    .sort()
    .limitFields()
    .paginate();

  const [tags, meta] = await Promise.all([features.query, features.countTotal(Tag)]);
  sendResponse(res, 200, 'Tags fetched', { tags }, meta);
});

/**
 * @desc    Get a single tag by slug
 * @route   GET /api/tags/:slug
 * @access  Public
 */
const getTagBySlug = asyncHandler(async (req, res) => {
  const tag = await Tag.findOne({ slug: req.params.slug });
  if (!tag) throw ApiError.notFound('Tag not found');
  sendResponse(res, 200, 'Tag fetched', { tag });
});

/**
 * @desc    Create a tag. Also used implicitly by blog creation via
 *          findOrCreateTags() in blogController — this endpoint is for
 *          admins pre-seeding tags directly.
 * @route   POST /api/tags
 * @access  Private/Admin
 */
const createTag = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) throw ApiError.badRequest('Tag name is required');

  const existing = await Tag.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
  if (existing) throw ApiError.conflict('This tag already exists');

  const tag = await Tag.create({ name: name.trim() });
  sendResponse(res, 201, 'Tag created successfully', { tag });
});

/**
 * @desc    Update a tag
 * @route   PUT /api/tags/:id
 * @access  Private/Admin
 */
const updateTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);
  if (!tag) throw ApiError.notFound('Tag not found');

  const { name } = req.body;
  if (name && name.toLowerCase() !== tag.name.toLowerCase()) {
    const existing = await Tag.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) throw ApiError.conflict('This tag already exists');
    tag.name = name;
  }

  await tag.save();
  sendResponse(res, 200, 'Tag updated successfully', { tag });
});

/**
 * @desc    Delete a tag (removes it from any blogs referencing it)
 * @route   DELETE /api/tags/:id
 * @access  Private/Admin
 */
const deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);
  if (!tag) throw ApiError.notFound('Tag not found');

  // Unlike categories, tags are many-to-many, so deleting one just pulls
  // it out of any blogs that reference it rather than blocking deletion.
  await Blog.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } });
  await tag.deleteOne();

  sendResponse(res, 200, 'Tag deleted successfully');
});

module.exports = { getTags, getTagBySlug, createTag, updateTag, deleteTag };
