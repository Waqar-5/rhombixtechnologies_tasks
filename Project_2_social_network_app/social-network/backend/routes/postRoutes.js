const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getUserPosts,
  getPostById,
  toggleLike,
  deletePost,
  editPost,
  toggleSave,
  sharePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/feed', getFeed);
router.post('/', upload.array('media', 6), createPost);
router.get('/user/:userId', getUserPosts);
router.get('/:postId', getPostById);
router.put('/:postId', editPost);
router.delete('/:postId', deletePost);
router.put('/:postId/like', toggleLike);
router.put('/:postId/save', toggleSave);
router.post('/:postId/share', sharePost);

module.exports = router;
