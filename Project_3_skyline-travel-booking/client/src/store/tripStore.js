import { create } from 'zustand';

// Holds the in-progress trip selection as the user moves through
// search -> destination -> hotel/flight -> booking -> confirmation.
export const useTripStore = create((set) => ({
  destination: null,
  hotel: null,
  flight: null,
  checkIn: '',
  checkOut: '',
  guests: 2,

  setDestination: (destination) => set({ destination }),
  setHotel: (hotel) => set({ hotel }),
  setFlight: (flight) => set({ flight }),
  setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
  setGuests: (guests) => set({ guests }),
  reset: () => set({ destination: null, hotel: null, flight: null, checkIn: '', checkOut: '', guests: 2 })
}));

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}
