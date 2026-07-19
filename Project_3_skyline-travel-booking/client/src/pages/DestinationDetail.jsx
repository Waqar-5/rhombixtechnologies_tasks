import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Users, Calendar, PlaneTakeoff } from 'lucide-react';
import { catalogService } from '../lib/api';
import { useTripStore, nightsBetween } from '../store/tripStore';
import HotelCard from '../components/HotelCard';
import FlightCard from '../components/FlightCard';

const ORIGINS = [
  { code: 'JFK', city: 'New York' },
  { code: 'LHR', city: 'London' },
  { code: 'DXB', city: 'Dubai' },
  { code: 'SIN', city: 'Singapore' },
  { code: 'KHI', city: 'Karachi' }
];

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [flights, setFlights] = useState([]);
  const [flightSource, setFlightSource] = useState('mock');
  const [originCode, setOriginCode] = useState(ORIGINS[0].code);
  const [flightsLoading, setFlightsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const { hotel, flight, checkIn, checkOut, guests, setDestination: setTripDestination, setHotel, setFlight, setDates, setGuests } =
    useTripStore();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      catalogService.destination(id),
      catalogService.hotels({ destinationId: id })
    ])
      .then(([dest, htls]) => {
        setDestination(dest);
        setTripDestination(dest);
        setHotels(htls);
        if (!checkIn || !checkOut) {
          const today = new Date();
          const start = new Date(today.getTime() + 14 * 86400000);
          const end = new Date(today.getTime() + 20 * 86400000);
          setDates(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Separate effect: refetch flights whenever the destination or the
  // chosen origin airport changes. Passing originCode is what lets the
  // backend attempt a live Amadeus search instead of the mock catalog.
  useEffect(() => {
    if (!id) return;
    setFlightsLoading(true);
    catalogService
      .flights({ destinationId: id, originCode, departureDate: checkIn || undefined })
      .then((results) => {
        setFlights(results.slice(0, 5));
        setFlightSource(results.some((f) => f.source === 'amadeus-live') ? 'amadeus-live' : 'mock');
        setFlight(null); // previous selection may no longer be in the new list
      })
      .finally(() => setFlightsLoading(false));
  }, [id, originCode, checkIn, setFlight]);

  const nights = nightsBetween(checkIn, checkOut);
  const total = (hotel ? hotel.pricePerNight * nights : 0) + (flight ? flight.price : 0);
  const canContinue = hotel && flight && checkIn && checkOut;

  if (loading || !destination) {
    return <div className="mx-auto max-w-7xl px-6 py-20 text-center font-mono text-sm text-navy/40">Loading destination…</div>;
  }

  return (
    <div>
      <div className="relative h-72 w-full overflow-hidden sm:h-96">
        <img src={destination.image} alt={destination.city} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-7xl px-6 pb-8 text-paper">
          <span className="font-mono text-xs uppercase tracking-widest text-amber">{destination.code} · {destination.country}</span>
          <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">{destination.city}</h1>
          <p className="mt-1 flex items-center gap-1 text-paper/80">
            <Star className="h-4 w-4 fill-amber text-amber" /> {destination.rating} · {destination.tagline}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {/* Dates & guests */}
          <div className="flex flex-wrap gap-4 rounded-lg border border-navy/10 bg-white p-4">
            <label className="flex flex-col gap-1 text-xs">
              <span className="flex items-center gap-1 font-mono uppercase tracking-widest text-navy/50">
                <Calendar className="h-3 w-3" /> Check-in
              </span>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setDates(e.target.value, checkOut)}
                className="rounded-md border border-navy/15 px-3 py-1.5 font-mono-num text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="flex items-center gap-1 font-mono uppercase tracking-widest text-navy/50">
                <Calendar className="h-3 w-3" /> Check-out
              </span>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setDates(checkIn, e.target.value)}
                className="rounded-md border border-navy/15 px-3 py-1.5 font-mono-num text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="flex items-center gap-1 font-mono uppercase tracking-widest text-navy/50">
                <Users className="h-3 w-3" /> Guests
              </span>
              <input
                type="number"
                min={1}
                max={8}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-20 rounded-md border border-navy/15 px-3 py-1.5 font-mono-num text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="flex items-center gap-1 font-mono uppercase tracking-widest text-navy/50">
                <PlaneTakeoff className="h-3 w-3" /> Flying from
              </span>
              <select
                value={originCode}
                onChange={(e) => setOriginCode(e.target.value)}
                className="rounded-md border border-navy/15 px-3 py-1.5 font-mono-num text-sm"
              >
                {ORIGINS.map((o) => (
                  <option key={o.code} value={o.code}>{o.city} ({o.code})</option>
                ))}
              </select>
            </label>
          </div>

          {/* Flights */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-semibold text-navy">Choose a flight</h2>
              {flightSource === 'amadeus-live' && (
                <span className="flex items-center gap-1 rounded-full bg-teal/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-teal">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" /> Live pricing
                </span>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {flightsLoading ? (
                <p className="font-mono text-sm text-navy/40">Searching flights…</p>
              ) : flights.length === 0 ? (
                <p className="font-mono text-sm text-navy/40">No flights found from this origin — try another.</p>
              ) : (
                flights.map((f) => (
                  <FlightCard key={f.id} flight={f} selected={flight?.id === f.id} onSelect={setFlight} />
                ))
              )}
            </div>
          </div>

          {/* Hotels */}
          <div>
            <h2 className="font-display text-xl font-semibold text-navy">Choose a stay</h2>
            <div className="mt-4 space-y-3">
              {hotels.map((h) => (
                <HotelCard key={h.id} hotel={h} selected={hotel?.id === h.id} onSelect={setHotel} />
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-lg border border-navy/10 bg-white p-5 lg:sticky lg:top-24">
          <h3 className="font-display text-lg font-semibold text-navy">Trip summary</h3>
          <div className="mt-4 space-y-2 font-mono text-sm">
            <Row label="Destination" value={`${destination.city} (${destination.code})`} />
            <Row label="Dates" value={checkIn && checkOut ? `${checkIn} → ${checkOut}` : '—'} />
            <Row label="Nights" value={String(nights)} />
            <Row label="Guests" value={String(guests)} />
            <Row label="Flight" value={flight ? `$${flight.price}` : 'Not selected'} />
            <Row label="Hotel" value={hotel ? `$${hotel.pricePerNight} × ${nights}` : 'Not selected'} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-navy/10 pt-4">
            <span className="font-mono text-xs uppercase tracking-widest text-navy/50">Total</span>
            <span className="font-mono-num text-xl font-semibold text-navy">${total || 0}</span>
          </div>
          <button
            disabled={!canContinue}
            onClick={() => navigate('/booking')}
            className="mt-4 w-full rounded-full bg-navy py-3 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-navy/30"
          >
            {canContinue ? 'Continue to booking' : 'Select a flight & stay'}
          </button>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-navy/70">
      <span className="text-navy/40">{label}</span>
      <span className="text-navy">{value}</span>
    </div>
  );
}
