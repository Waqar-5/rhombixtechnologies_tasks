const express = require('express');
const {
  applyToJob,
  withdrawApplication,
  getMyApplications,
  getJobApplicants,
  getAllApplicantsForRecruiter,
  updateApplicationStatus,
  getApplicationById
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.get('/mine', protect, authorize('jobseeker'), getMyApplications);
router.get('/recruiter/all', protect, authorize('recruiter'), getAllApplicantsForRecruiter);
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplicants);

router.post('/:jobId', protect, authorize('jobseeker'), applyToJob);
router.delete('/:id', protect, authorize('jobseeker'), withdrawApplication);
router.put('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);
router.get('/:id', protect, getApplicationById);

module.exports = router;
