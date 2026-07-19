import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';
import { useTripStore, nightsBetween } from '../store/tripStore';
import { useAuthStore } from '../store/authStore';
import { bookingService } from '../lib/api';

export default function Booking() {
  const navigate = useNavigate();
  const { destination, hotel, flight, checkIn, checkOut, guests, reset } = useTripStore();
  const { user } = useAuthStore();

  const [passengerName, setPassengerName] = useState(user?.name || '');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const nights = nightsBetween(checkIn, checkOut);
  const total = (hotel ? hotel.pricePerNight * nights : 0) + (flight ? flight.price : 0);

  if (!destination || !hotel || !flight) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="font-display text-xl text-navy">No trip in progress.</p>
        <p className="mt-1 text-sm text-navy/50">Search for a destination to start a booking.</p>
        <button onClick={() => navigate('/search')} className="mt-6 rounded-full bg-navy px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-paper">
          Search destinations
        </button>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!passengerName.trim()) return setError('Enter the passenger name for this booking.');
    if (card.number.replace(/\s/g, '').length < 12) return setError('Enter a valid card number.');

    setSubmitting(true);
    try {
      const booking = await bookingService.create({
        destinationId: destination.id,
        hotelId: hotel.id,
        flightId: flight.id,
        checkIn,
        checkOut,
        guests,
        totalPrice: total,
        passengerName,
        paymentMethod: { cardNumber: card.number.replace(/\s/g, '') }
      });
      reset();
      navigate(`/confirmation/${booking.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong processing your booking.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <span className="font-mono text-xs uppercase tracking-widest text-teal">Final step</span>
      <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Confirm your booking</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-navy/10 bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-navy">Passenger details</h2>
            <label className="mt-4 block text-xs font-mono uppercase tracking-widest text-navy/50">
              Full name
              <input
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="As it appears on ID"
                className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2 font-body text-sm text-navy normal-case focus:border-navy/40 focus:outline-none"
              />
            </label>
          </div>

          <div className="rounded-lg border border-navy/10 bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
              <CreditCard className="h-5 w-5 text-teal" /> Payment
            </h2>
            <p className="mt-1 text-xs text-navy/40">Demo payment — no real card is charged.</p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-navy/50 sm:col-span-2">
                Card number
                <input
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                  placeholder="4242 4242 4242 4242"
                  className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2 font-mono-num text-sm text-navy focus:border-navy/40 focus:outline-none"
                />
              </label>
              <label className="block text-xs font-mono uppercase tracking-widest text-navy/50">
                Expiry
                <input
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  placeholder="MM/YY"
                  className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2 font-mono-num text-sm text-navy focus:border-navy/40 focus:outline-none"
                />
              </label>
              <label className="block text-xs font-mono uppercase tracking-widest text-navy/50">
                CVV
                <input
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  placeholder="123"
                  className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2 font-mono-num text-sm text-navy focus:border-navy/40 focus:outline-none"
                />
              </label>
            </div>
            <p className="mt-3 flex items-center gap-1 font-mono text-[11px] text-navy/40">
              <Lock className="h-3 w-3" /> Try card 4000 0000 0000 0002 to see a declined payment.
            </p>
          </div>

          {error && <p className="rounded-md bg-alert/10 px-4 py-2 text-sm text-alert">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-navy py-3 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-navy-light disabled:opacity-60"
          >
            {submitting ? 'Processing…' : `Pay $${total} and confirm`}
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-navy/10 bg-white p-5 lg:sticky lg:top-24">
          <h3 className="font-display text-lg font-semibold text-navy">{destination.city}, {destination.country}</h3>
          <div className="mt-3 space-y-2 font-mono text-sm text-navy/70">
            <div className="flex justify-between"><span className="text-navy/40">Dates</span><span>{checkIn} → {checkOut}</span></div>
            <div className="flex justify-between"><span className="text-navy/40">Flight</span><span>{flight.flightNumber}</span></div>
            <div className="flex justify-between"><span className="text-navy/40">Hotel</span><span className="truncate max-w-[150px]">{hotel.name}</span></div>
            <div className="flex justify-between"><span className="text-navy/40">Guests</span><span>{guests}</span></div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-navy/10 pt-4">
            <span className="font-mono text-xs uppercase tracking-widest text-navy/50">Total</span>
            <span className="font-mono-num text-xl font-semibold text-navy">${total}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
