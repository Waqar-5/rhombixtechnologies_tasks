import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function DestinationCard({ destination }) {
  return (
    <Link
      to={`/destinations/${destination.id}`}
      className="group block overflow-hidden rounded-lg border border-navy/10 bg-white transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={destination.image}
          alt={destination.city}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 rounded-full bg-navy/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-amber backdrop-blur">
          {destination.code}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-navy">{destination.city}</h3>
            <p className="text-sm text-navy/50">{destination.country}</p>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs text-navy/70">
            <Star className="h-3.5 w-3.5 fill-amber text-amber" />
            {destination.rating}
          </div>
        </div>
        <p className="mt-2 text-sm text-navy/60">{destination.tagline}</p>
        <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
          <span className="font-mono text-sm text-navy">
            <span className="text-navy/40">from</span> ${destination.pricePerNightFrom}<span className="text-navy/40">/night</span>
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-teal">View →</span>
        </div>
      </div>
    </Link>
  );
}
