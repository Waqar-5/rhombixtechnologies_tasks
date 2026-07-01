const express = require('express');
const router = express.Router();
const {
  sendRequest,
  acceptRequest,
  declineRequest,
  cancelRequest,
  unfriend,
  getReceivedRequests,
  getSentRequests,
  getMyFriends,
} = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getMyFriends);
router.get('/requests/received', getReceivedRequests);
router.get('/requests/sent', getSentRequests);
router.post('/request/:userId', sendRequest);
router.put('/accept/:requestId', acceptRequest);
router.put('/decline/:requestId', declineRequest);
router.delete('/cancel/:requestId', cancelRequest);
router.delete('/:userId', unfriend);

module.exports = router;
