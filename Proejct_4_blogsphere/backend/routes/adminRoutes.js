const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/dashboard', adminController.getDashboard);

// --- Users ---
router.get('/users', adminController.getUsers);
router.patch('/users/:id', adminController.updateUser);
router.patch('/users/:id/block', adminController.blockUser);
router.patch('/users/:id/unblock', adminController.unblockUser);
router.delete('/users/:id', adminController.deleteUser);

// --- Blogs ---
router.get('/blogs', adminController.getAllBlogsAdmin);
router.patch('/blogs/:id/feature', adminController.toggleFeatureBlog);
router.patch('/blogs/:id/approve', adminController.approveBlog);
router.patch('/blogs/:id/reject', adminController.rejectBlog);
router.delete('/blogs/:id', adminController.adminDeleteBlog);

// --- Comments ---
router.get('/comments', adminController.getAllCommentsAdmin);
router.patch('/comments/:id/status', adminController.updateCommentStatus);
router.delete('/comments/:id', adminController.adminDeleteComment);

module.exports = router;
