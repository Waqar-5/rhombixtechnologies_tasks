const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Blog = require('../models/Blog');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

/**
 * @desc    Get all categories (public, supports search/sort/pagination)
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Category.find(), req.query)
    .search(['name', 'description'])
    .sort()
    .limitFields()
    .paginate();

  const [categories, meta] = await Promise.all([
    features.query,
    features.countTotal(Category),
  ]);

  sendResponse(res, 200, 'Categories fetched', { categories }, meta);
});

/**
 * @desc    Get a single category by slug
 * @route   GET /api/categories/:slug
 * @access  Public
 */
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw ApiError.notFound('Category not found');
  sendResponse(res, 200, 'Category fetched', { category });
});

/**
 * @desc    Create a category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
  if (existing) throw ApiError.conflict('A category with this name already exists');

  let image;
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'blogsphere/categories');
    image = { url: result.url, publicId: result.publicId };
  }

  const category = await Category.create({ name, description, image });
  sendResponse(res, 201, 'Category created successfully', { category });
});

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const { name, description } = req.body;

  if (name && name.toLowerCase() !== category.name.toLowerCase()) {
    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) throw ApiError.conflict('A category with this name already exists');
    category.name = name;
  }
  if (description !== undefined) category.description = description;

  if (req.file) {
    if (category.image?.publicId) await deleteFromCloudinary(category.image.publicId);
    const result = await uploadBufferToCloudinary(req.file.buffer, 'blogsphere/categories');
    category.image = { url: result.url, publicId: result.publicId };
  }

  await category.save();
  sendResponse(res, 200, 'Category updated successfully', { category });
});

/**
 * @desc    Delete a category (blocked if blogs still reference it)
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const blogCount = await Blog.countDocuments({ category: category._id });
  if (blogCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete category with ${blogCount} associated blog(s). Reassign or delete them first.`
    );
  }

  if (category.image?.publicId) await deleteFromCloudinary(category.image.publicId);
  await category.deleteOne();

  sendResponse(res, 200, 'Category deleted successfully');
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
