import { Plane, Calendar, Users, MapPin } from 'lucide-react';

export default function BoardingPass({ booking, destination, hotel, flight }) {
  return (
    <div className="relative flex flex-col overflow-visible rounded-xl bg-navy text-paper shadow-2xl sm:flex-row">
      {/* Main stub */}
      <div className="flex-1 p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-amber/80">Boarding Pass</span>
            <h3 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
              {destination?.city || 'Trip'} <span className="text-paper/40">/</span> {destination?.country}
            </h3>
          </div>
          <Plane className="h-8 w-8 flex-shrink-0 rotate-45 text-amber" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Field label="Passenger" value={booking.passengerName} />
          <Field label="Confirmation" value={booking.confirmationCode} mono />
          <Field label="Check-in" value={booking.checkIn} mono icon={<Calendar className="h-3 w-3" />} />
          <Field label="Check-out" value={booking.checkOut} mono icon={<Calendar className="h-3 w-3" />} />
          <Field label="Guests" value={String(booking.guests)} icon={<Users className="h-3 w-3" />} />
          <Field label="Status" value={booking.status} />
          {flight && <Field label="Flight" value={`${flight.flightNumber} · ${flight.originCode}→${flight.destinationCode}`} mono />}
          {hotel && <Field label="Stay" value={hotel.name} />}
        </div>
      </div>

      {/* Tear line */}
      <div className="relative flex sm:flex-col">
        <div className="tear-line hidden w-px sm:block" style={{ backgroundSize: '14px 14px' }} />
      </div>

      {/* Stub */}
      <div className="relative flex flex-row items-center justify-between gap-4 border-t border-dashed border-paper/20 p-6 sm:w-48 sm:flex-col sm:items-start sm:justify-center sm:border-l sm:border-t-0">
        <span className="notch-left -top-3 hidden sm:block" style={{ top: '-12px', left: '-12px' }} />
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-paper/40">Gate</span>
          <p className="font-mono-num text-xl font-semibold text-amber">{destination?.code || '—'}</p>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs text-paper/60">
          <MapPin className="h-3 w-3" /> {booking.totalPrice ? `$${booking.totalPrice} total` : ''}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono, icon }) {
  return (
    <div>
      <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-paper/40">
        {icon}
        {label}
      </span>
      <p className={`mt-0.5 text-sm ${mono ? 'font-mono-num' : ''} capitalize text-paper`}>{value}</p>
    </div>
  );
}
