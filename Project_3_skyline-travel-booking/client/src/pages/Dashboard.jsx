import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BoardingPass from '../components/BoardingPass';
import { bookingService, catalogService } from '../lib/api';

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [destinations, setDestinations] = useState({});
  const [hotels, setHotels] = useState({});
  const [flights, setFlights] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [myBookings, dests] = await Promise.all([bookingService.mine(), catalogService.destinations()]);
        setBookings(myBookings);
        setDestinations(Object.fromEntries(dests.map((d) => [d.id, d])));

        const hotelIds = [...new Set(myBookings.map((b) => b.hotelId).filter(Boolean))];
        const flightIds = [...new Set(myBookings.map((b) => b.flightId).filter(Boolean))];
        const [htlResults, fltResults] = await Promise.all([
          Promise.allSettled(hotelIds.map((id) => catalogService.hotel(id))),
          Promise.allSettled(flightIds.map((id) => catalogService.flight(id)))
        ]);
        setHotels(
          Object.fromEntries(
            htlResults.filter((r) => r.status === 'fulfilled').map((r) => [r.value.id, r.value])
          )
        );
        setFlights(
          Object.fromEntries(
            fltResults.filter((r) => r.status === 'fulfilled').map((r) => [r.value.id, r.value])
          )
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCancel(id) {
    const updated = await bookingService.cancel(id);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <span className="font-mono text-xs uppercase tracking-widest text-teal">My trips</span>
      <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Your boarding passes</h1>

      {loading ? (
        <p className="mt-8 font-mono text-sm text-navy/40">Loading your trips…</p>
      ) : bookings.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-navy/20 p-12 text-center">
          <p className="font-display text-lg text-navy">No trips booked yet.</p>
          <Link to="/search" className="mt-4 inline-block rounded-full bg-navy px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-paper">
            Search destinations
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {bookings.map((b) => (
            <div key={b.id}>
              <BoardingPass
                booking={b}
                destination={destinations[b.destinationId]}
                hotel={hotels[b.hotelId]}
                flight={flights[b.flightId]}
              />
              {b.status !== 'cancelled' && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="mt-2 font-mono text-xs uppercase tracking-widest text-alert hover:underline"
                >
                  Cancel this trip
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
