const express = require('express');
const tagController = require('../controllers/tagController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/', tagController.getTags);
router.get('/:slug', tagController.getTagBySlug);

router.post('/', protect, restrictTo('admin'), tagController.createTag);
router.put('/:id', protect, restrictTo('admin'), tagController.updateTag);
router.delete('/:id', protect, restrictTo('admin'), tagController.deleteTag);

module.exports = router;
