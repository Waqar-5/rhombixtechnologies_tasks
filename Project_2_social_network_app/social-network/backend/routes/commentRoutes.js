const express = require('express');
const router = express.Router();
const {
  addComment,
  getComments,
  toggleCommentLike,
  editComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:postId', getComments);
router.post('/:postId', addComment);
router.put('/:commentId/like', toggleCommentLike);
router.put('/:commentId', editComment);
router.delete('/:commentId', deleteComment);

module.exports = router;
