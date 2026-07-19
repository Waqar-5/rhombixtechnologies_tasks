import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createNewBooking, myBookings, getBooking, cancelExistingBooking } from '../controllers/bookingController.js';

const router = Router();

router.use(requireAuth);
router.post('/', asyncHandler(createNewBooking));
router.get('/', asyncHandler(myBookings));
router.get('/:id', asyncHandler(getBooking));
router.patch('/:id/cancel', asyncHandler(cancelExistingBooking));

export default router;
