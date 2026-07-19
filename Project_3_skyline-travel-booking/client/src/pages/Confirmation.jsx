import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BoardingPass from '../components/BoardingPass';
import { bookingService, catalogService } from '../lib/api';

export default function Confirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [destination, setDestination] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.get(id).then(async (b) => {
      setBooking(b);
      const [dest, htl, flt] = await Promise.allSettled([
        catalogService.destination(b.destinationId),
        b.hotelId ? catalogService.hotel(b.hotelId) : Promise.resolve(null),
        b.flightId ? catalogService.flight(b.flightId) : Promise.resolve(null)
      ]);
      setDestination(dest.status === 'fulfilled' ? dest.value : null);
      setHotel(htl.status === 'fulfilled' ? htl.value : null);
      setFlight(flt.status === 'fulfilled' ? flt.value : null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading || !booking) {
    return <div className="mx-auto max-w-7xl px-6 py-20 text-center font-mono text-sm text-navy/40">Retrieving your pass…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-teal">Confirmed</span>
          <h1 className="mt-1 font-display text-3xl font-semibold text-navy">You're all booked, {booking.passengerName.split(' ')[0]}</h1>
          <p className="mt-2 text-sm text-navy/50">Here's your boarding pass — save the confirmation code below.</p>
        </div>

        <div className="mt-8">
          <BoardingPass booking={booking} destination={destination} hotel={hotel} flight={flight} />
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link to="/dashboard" className="rounded-full bg-navy px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-paper hover:bg-navy-light">
            View my trips
          </Link>
          <Link to="/search" className="rounded-full border border-navy/20 px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-navy hover:border-navy">
            Book another trip
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
