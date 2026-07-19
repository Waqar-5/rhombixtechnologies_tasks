import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  listDestinations,
  getDestination,
  listHotels,
  getHotel,
  listFlights,
  getFlight,
  listOrigins
} from '../controllers/catalogController.js';

const router = Router();

router.get('/destinations', asyncHandler(listDestinations));
router.get('/destinations/:id', asyncHandler(getDestination));
router.get('/hotels', asyncHandler(listHotels));
router.get('/hotels/:id', asyncHandler(getHotel));
router.get('/flights', asyncHandler(listFlights));
router.get('/flights/:id', asyncHandler(getFlight));
router.get('/origins', asyncHandler(listOrigins));

export default router;
