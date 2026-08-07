const { body } = require('express-validator');

const categoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters'),
];

module.exports = { categoryValidator };
