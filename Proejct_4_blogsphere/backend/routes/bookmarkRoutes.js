const express = require('express');
const bookmarkController = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, bookmarkController.getMyBookmarks);

module.exports = router;
