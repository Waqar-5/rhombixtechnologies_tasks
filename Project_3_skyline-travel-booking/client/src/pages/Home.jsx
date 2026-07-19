import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero3D from '../components/Hero3D';
import ErrorBoundary from '../components/ErrorBoundary';
import DepartureBoard from '../components/DepartureBoard';
import DestinationCard from '../components/DestinationCard';
import { catalogService } from '../lib/api';

export default function Home() {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    catalogService.destinations().then(setDestinations).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-navy/10 bg-paper">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-teal">Flight status: boarding</span>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-navy sm:text-6xl">
              Your next trip,
              <br />
              <span className="text-amber-dim">gate to gate.</span>
            </h1>
            <p className="mt-5 max-w-md text-navy/60">
              Search flights and stays across eight destinations, hold your seat, and
              walk away with a real boarding pass — not just a confirmation email.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="rounded-full bg-navy px-6 py-3 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-navy-light"
              >
                Start searching
              </Link>
              <Link
                to="/search?tag=adventure"
                className="rounded-full border border-navy/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-navy transition hover:border-navy"
              >
                Browse adventure trips
              </Link>
            </div>
          </motion.div>

          <div className="h-80 w-full sm:h-[420px]">
            <ErrorBoundary
              fallback={
                <div className="flex h-full w-full items-center justify-center rounded-2xl border border-navy/10 bg-navy/5">
                  <span className="font-mono text-xs uppercase tracking-widest text-navy/40">
                    3D preview unavailable on this device
                  </span>
                </div>
              }
            >
              <Hero3D />
            </ErrorBoundary>
          </div>
        </div>
      </section>

      {/* Departure board */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-teal">Now boarding</span>
            <h2 className="mt-1 font-display text-3xl font-semibold text-navy">Popular departures</h2>
          </div>
          <Link to="/search" className="font-mono text-xs uppercase tracking-widest text-navy/50 hover:text-navy">
            View all →
          </Link>
        </div>
        <DepartureBoard destinations={destinations.slice(0, 6)} />
      </section>

      {/* Destination grid */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <span className="font-mono text-xs uppercase tracking-widest text-teal">Where to</span>
        <h2 className="mt-1 font-display text-3xl font-semibold text-navy">Featured destinations</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
      </section>
    </div>
  );
}
