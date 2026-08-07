const { body } = require('express-validator');
const mongoose = require('mongoose');

const createCommentValidator = [
  body('content')
    .trim()
    .notEmpty().withMessage('Comment cannot be empty')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  body('parentComment')
    .optional({ nullable: true })
    .custom((value) => value === null || mongoose.isValidObjectId(value))
    .withMessage('Invalid parent comment ID'),
];

const reportCommentValidator = [
  body('reason')
    .trim()
    .notEmpty().withMessage('A reason is required to report a comment')
    .isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters'),
];

module.exports = { createCommentValidator, reportCommentValidator };
