import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function DepartureBoard({ destinations }) {
  return (
    <div className="overflow-hidden rounded-lg border border-amber/20 bg-navy shadow-2xl">
      <div className="flex items-center justify-between border-b border-amber/20 px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber/80">Departures</span>
        <span className="flex items-center gap-2 font-mono text-[11px] text-teal">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
          Live
        </span>
      </div>

      <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-paper/40 sm:grid">
        <span>Destination</span>
        <span>Code</span>
        <span>From</span>
        <span>Status</span>
      </div>

      <div className="divide-y divide-paper/10">
        {destinations.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            <Link
              to={`/destinations/${d.id}`}
              className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 font-mono text-sm text-paper transition hover:bg-paper/5 sm:grid-cols-[1fr_auto_auto_auto]"
            >
              <span className="truncate">{d.city}, {d.country}</span>
              <span className="hidden text-amber sm:inline">{d.code}</span>
              <span className="hidden text-paper/70 sm:inline">${d.pricePerNightFrom}/nt</span>
              <span className="text-[11px] uppercase tracking-wide text-teal">On time</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
