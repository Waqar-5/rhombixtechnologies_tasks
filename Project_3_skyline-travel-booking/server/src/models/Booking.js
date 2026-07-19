import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    destinationId: { type: String, required: true },
    hotelId: { type: String },
    flightId: { type: String },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    guests: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
    passengerName: { type: String, required: true },
    confirmationCode: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
