const express = require('express');
const {
  updateProfile,
  uploadResume: uploadResumeCtrl,
  deleteResume,
  uploadAvatar: uploadAvatarCtrl,
  getUserById,
  deactivateAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { uploadResume, uploadAvatar } = require('../middleware/upload');

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deactivateAccount);

router.post('/resume', protect, authorize('jobseeker'), uploadResume.single('resume'), uploadResumeCtrl);
router.delete('/resume', protect, authorize('jobseeker'), deleteResume);

router.post('/avatar', protect, uploadAvatar.single('avatar'), uploadAvatarCtrl);

router.get('/:id', protect, authorize('recruiter'), getUserById);

module.exports = router;
