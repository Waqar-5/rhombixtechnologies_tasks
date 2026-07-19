import { Check, Star } from 'lucide-react';

export default function HotelCard({ hotel, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(hotel)}
      className={`flex w-full gap-4 rounded-lg border p-3 text-left transition ${
        selected ? 'border-amber bg-amber/5 ring-1 ring-amber' : 'border-navy/10 bg-white hover:border-navy/30'
      }`}
    >
      <img src={hotel.image} alt={hotel.name} className="h-24 w-32 flex-shrink-0 rounded-md object-cover" loading="lazy" />
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-display font-semibold text-navy">{hotel.name}</h4>
            {selected && (
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber text-navy">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1 font-mono text-xs text-navy/60">
            <Star className="h-3 w-3 fill-amber text-amber" /> {hotel.rating} · {hotel.roomsAvailable} rooms left
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 3).map((a) => (
              <span key={a} className="rounded-full bg-navy/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/50">
                {a}
              </span>
            ))}
          </div>
          <span className="font-mono-num text-sm font-semibold text-navy">${hotel.pricePerNight}<span className="font-normal text-navy/40">/nt</span></span>
        </div>
      </div>
    </button>
  );
}
