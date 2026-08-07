const express = require('express');
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCommentValidator, reportCommentValidator } = require('../validators/commentValidators');

const router = express.Router();

router.get('/:commentId/replies', commentController.getReplies);
router.post('/:id/like', protect, commentController.toggleCommentLike);
router.put('/:id', protect, createCommentValidator, validate, commentController.updateComment);
router.delete('/:id', protect, commentController.deleteComment);
router.post('/:id/report', protect, reportCommentValidator, validate, commentController.reportComment);

module.exports = router;
