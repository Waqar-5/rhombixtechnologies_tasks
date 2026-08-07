const { body } = require('express-validator');
const mongoose = require('mongoose');

// Drafts are work-in-progress by definition — a person should be able to
// save a half-written post with a placeholder title. Full validation only
// kicks in once status is (or is being changed to) 'published' or 'pending'.
const isPublishing = (req) => req.body.status === 'published' || req.body.status === 'pending';

// Multipart/FormData requests (used for blog create/update, since they
// also carry image files) can only send strings and files — never real
// arrays. The frontend JSON.stringifies the tags array before appending it,
// so here we accept either a real array (e.g. a plain JSON request) or a
// JSON-encoded string of one, rather than rejecting the string form outright.
const validateTagsField = (value) => {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value)) return true;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return true;
    } catch {
      // fall through to failure below
    }
  }
  throw new Error('Tags must be an array');
};

const createBlogValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters')
    .custom((value, { req }) => {
      if (isPublishing(req) && value.length < 5) {
        throw new Error('Title must be at least 5 characters to publish');
      }
      return true;
    }),
  body('content')
    .custom((value, { req }) => {
      const plainLength = (value || '').replace(/<[^>]*>/g, '').trim().length;
      if (isPublishing(req)) {
        if (plainLength === 0) throw new Error('Content is required to publish');
        if (plainLength < 50) throw new Error('Content must be at least 50 characters to publish');
      }
      return true;
    }),
  body('excerpt')
    .optional({ checkFalsy: true })
    .isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
  body('category')
    .custom((value, { req }) => {
      if (!value) {
        if (isPublishing(req)) throw new Error('Category is required to publish');
        return true; // drafts can be saved without a category
      }
      if (!mongoose.isValidObjectId(value)) throw new Error('Invalid category ID');
      return true;
    }),
  body('tags').custom(validateTagsField).withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'pending']).withMessage('Invalid status'),
];

const updateBlogValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters')
    .custom((value, { req }) => {
      if (isPublishing(req) && value.length < 5) {
        throw new Error('Title must be at least 5 characters to publish');
      }
      return true;
    }),
  body('content')
    .optional()
    .custom((value, { req }) => {
      const plainLength = (value || '').replace(/<[^>]*>/g, '').trim().length;
      if (isPublishing(req)) {
        if (plainLength === 0) throw new Error('Content is required to publish');
        if (plainLength < 50) throw new Error('Content must be at least 50 characters to publish');
      }
      return true;
    }),
  body('excerpt')
    .optional({ checkFalsy: true })
    .isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
  body('category')
    .optional()
    .custom((value, { req }) => {
      if (!value) {
        if (isPublishing(req)) throw new Error('Category is required to publish');
        return true;
      }
      if (!mongoose.isValidObjectId(value)) throw new Error('Invalid category ID');
      return true;
    }),
  body('tags').custom(validateTagsField).withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'pending']).withMessage('Invalid status'),
];

module.exports = { createBlogValidator, updateBlogValidator };
