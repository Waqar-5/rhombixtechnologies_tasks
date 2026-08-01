const express = require('express');
const {
  getJobs,
  getFeaturedJobs,
  getJobBySlug,
  getSimilarJobs,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getRecruiterAnalytics
} = require('../controllers/jobController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

// Public
router.get('/', getJobs);
router.get('/featured', getFeaturedJobs);

// Recruiter-specific (must come before the /:slug catch-all)
router.get('/recruiter/mine', protect, authorize('recruiter'), getMyJobs);
router.get('/recruiter/analytics', protect, authorize('recruiter'), getRecruiterAnalytics);

router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

router.get('/:slug', optionalAuth, getJobBySlug);
router.get('/:slug/similar', getSimilarJobs);

module.exports = router;
