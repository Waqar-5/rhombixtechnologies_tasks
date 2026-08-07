const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { categoryValidator } = require('../validators/categoryValidators');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

router.post(
  '/',
  protect,
  restrictTo('admin'),
  uploadSingle('image'),
  categoryValidator,
  validate,
  categoryController.createCategory
);

router.put(
  '/:id',
  protect,
  restrictTo('admin'),
  uploadSingle('image'),
  categoryController.updateCategory
);

router.delete('/:id', protect, restrictTo('admin'), categoryController.deleteCategory);

module.exports = router;
