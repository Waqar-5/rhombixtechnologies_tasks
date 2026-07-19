import { createBooking, findBookingsByUser, findBookingById, cancelBooking } from '../data/bookingRepo.js';

export async function createNewBooking(req, res) {
  const {
    destinationId,
    hotelId,
    flightId,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    passengerName,
    paymentMethod
  } = req.body;

  if (!destinationId || !checkIn || !checkOut || !totalPrice || !passengerName) {
    return res.status(400).json({ message: 'Missing required booking details.' });
  }

  // Payment integration point: in production this is where you'd call
  // stripe.paymentIntents.create(...) and only persist the booking once
  // the charge succeeds. Here we simulate a successful authorization
  // for any payment method other than a deliberately-invalid test card.
  if (paymentMethod?.cardNumber === '4000000000000002') {
    return res.status(402).json({ message: 'Payment declined by the card issuer.' });
  }

  const booking = await createBooking({
    userId: req.userId,
    destinationId,
    hotelId: hotelId || null,
    flightId: flightId || null,
    checkIn,
    checkOut,
    guests: guests || 1,
    totalPrice,
    passengerName
  });

  res.status(201).json({ booking });
}

export async function myBookings(req, res) {
  const bookings = await findBookingsByUser(req.userId);
  res.json({ results: bookings });
}

export async function getBooking(req, res) {
  const booking = await findBookingById(req.params.id);
  if (!booking || booking.userId !== req.userId) {
    return res.status(404).json({ message: 'Booking not found.' });
  }
  res.json({ booking });
}

export async function cancelExistingBooking(req, res) {
  const booking = await cancelBooking(req.params.id, req.userId);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  res.json({ booking });
}
