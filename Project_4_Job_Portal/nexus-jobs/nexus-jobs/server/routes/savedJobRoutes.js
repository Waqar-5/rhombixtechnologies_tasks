const express = require('express');
const { saveJob, unsaveJob, getSavedJobs } = require('../controllers/savedJobController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.get('/', protect, authorize('jobseeker'), getSavedJobs);
router.post('/:jobId', protect, authorize('jobseeker'), saveJob);
router.delete('/:jobId', protect, authorize('jobseeker'), unsaveJob);

module.exports = router;
