const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, authorize('recruiter'), createCategory);

module.exports = router;
