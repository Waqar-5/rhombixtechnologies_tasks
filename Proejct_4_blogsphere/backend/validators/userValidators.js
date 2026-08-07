const { body } = require('express-validator');

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('bio').optional({ checkFalsy: true }).isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters'),
  body('website').optional({ checkFalsy: true }).isURL().withMessage('Website must be a valid URL'),
  body('github').optional({ checkFalsy: true }).isURL().withMessage('GitHub must be a valid URL'),
  body('linkedin').optional({ checkFalsy: true }).isURL().withMessage('LinkedIn must be a valid URL'),
  body('twitter').optional({ checkFalsy: true }).isURL().withMessage('Twitter must be a valid URL'),
  body('location').optional({ checkFalsy: true }).isLength({ max: 100 }),
  body('occupation').optional({ checkFalsy: true }).isLength({ max: 100 }),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
];

module.exports = { updateProfileValidator };
