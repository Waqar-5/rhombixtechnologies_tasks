const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileValidator } = require('../validators/userValidators');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

router.put('/profile', protect, updateProfileValidator, validate, userController.updateProfile);
router.put('/avatar', protect, uploadSingle('avatar'), userController.updateAvatar);
router.delete('/me', protect, userController.deleteMyAccount);
router.get('/:id', userController.getAuthorProfile);

module.exports = router;
