const express = require('express');
const {
  getCompanies,
  getCompanyBySlug,
  getMyCompany,
  updateMyCompany,
  uploadLogo: uploadLogoCtrl,
  uploadCover: uploadCoverCtrl
} = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { uploadCompanyImage } = require('../middleware/upload');

const router = express.Router();

router.get('/', getCompanies);
router.get('/me', protect, authorize('recruiter'), getMyCompany);
router.put('/me', protect, authorize('recruiter'), updateMyCompany);
router.post(
  '/me/logo',
  protect,
  authorize('recruiter'),
  uploadCompanyImage.single('logo'),
  uploadLogoCtrl
);
router.post(
  '/me/cover',
  protect,
  authorize('recruiter'),
  uploadCompanyImage.single('cover'),
  uploadCoverCtrl
);
router.get('/:slug', getCompanyBySlug);

module.exports = router;
