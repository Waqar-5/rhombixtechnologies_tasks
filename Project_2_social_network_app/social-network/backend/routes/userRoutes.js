const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  updateAvatar,
  updateCoverPhoto,
  updatePrivacy,
  searchUsers,
  getSuggestions,
  getUserFriends,
  getSavedPosts,
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Specific routes BEFORE the dynamic /:username route to avoid shadowing
router.get('/search', protect, searchUsers);
router.get('/suggestions', protect, getSuggestions);
router.get('/me/saved', protect, getSavedPosts);
router.put('/me', protect, updateProfile);
router.put('/me/privacy', protect, updatePrivacy);
router.post('/me/avatar', protect, upload.single('avatar'), updateAvatar);
router.post('/me/cover', protect, upload.single('coverPhoto'), updateCoverPhoto);

router.get('/:username/friends', optionalAuth, getUserFriends);
router.get('/:username', optionalAuth, getUserProfile);

module.exports = router;
