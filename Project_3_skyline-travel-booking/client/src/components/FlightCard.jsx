import { Check, PlaneTakeoff, PlaneLanding } from 'lucide-react';

export default function FlightCard({ flight, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(flight)}
      className={`w-full rounded-lg border p-4 text-left transition ${
        selected ? 'border-amber bg-amber/5 ring-1 ring-amber' : 'border-navy/10 bg-white hover:border-navy/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-navy/50">
          {flight.airline} · {flight.flightNumber}
        </span>
        {selected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber text-navy">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <div className="flex items-center gap-1.5 font-mono-num text-lg font-semibold text-navy">
            <PlaneTakeoff className="h-4 w-4 text-teal" /> {flight.departTime}
          </div>
          <div className="text-xs text-navy/50">{flight.originCity} ({flight.originCode})</div>
        </div>

        <div className="flex flex-col items-center font-mono text-[10px] text-navy/40">
          <span>{flight.durationHours}h {flight.stops === 0 ? 'nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
          <div className="my-1 h-px w-16 bg-navy/20" />
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 font-mono-num text-lg font-semibold text-navy">
            <PlaneLanding className="h-4 w-4 text-teal" /> {flight.destinationCode}
          </div>
          <div className="text-xs text-navy/50">{flight.destinationCity}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
        <span className="rounded-full bg-navy/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/50">{flight.cabin}</span>
        <span className="font-mono-num text-base font-semibold text-navy">${flight.price}</span>
      </div>
    </button>
  );
}
