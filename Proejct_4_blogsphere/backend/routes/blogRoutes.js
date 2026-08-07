const express = require('express');
const blogController = require('../controllers/blogController');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');
const bookmarkController = require('../controllers/bookmarkController');
const { protect, attachUserIfPresent } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createBlogValidator, updateBlogValidator } = require('../validators/blogValidators');
const { createCommentValidator } = require('../validators/commentValidators');
const { uploadBlogImages } = require('../middleware/upload');

const router = express.Router();

router.get('/', blogController.getBlogs);
router.get('/my-blogs', protect, blogController.getMyBlogs);
router.get('/id/:id', protect, blogController.getBlogById);
router.get('/:slug', attachUserIfPresent, blogController.getBlogBySlug);
router.get('/:slug/related', blogController.getRelatedBlogs);

router.post(
  '/',
  protect,
  uploadBlogImages,
  createBlogValidator,
  validate,
  blogController.createBlog
);

router.put(
  '/:id',
  protect,
  uploadBlogImages,
  updateBlogValidator,
  validate,
  blogController.updateBlog
);

router.delete('/:id', protect, blogController.deleteBlog);

// --- Nested comments (scoped to a specific blog via :blogId) ---
router.get('/:blogId/comments', commentController.getComments);
router.post(
  '/:blogId/comments',
  protect,
  createCommentValidator,
  validate,
  commentController.createComment
);

// --- Nested engagement ---
router.post('/:blogId/like', protect, likeController.toggleLike);
router.get('/:blogId/likes', likeController.getBlogLikers);
router.post('/:blogId/bookmark', protect, bookmarkController.toggleBookmark);

module.exports = router;
