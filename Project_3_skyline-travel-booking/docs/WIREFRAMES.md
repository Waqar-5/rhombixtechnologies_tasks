# Wireframes → Final UI

The task brief calls for wireframing before the final layout. `wireframes.svg`
in this folder is the low-fidelity pass across the five core screens, in
user-flow order:

1. **Home** — hero + 3D globe, live departure board, featured destinations
2. **Search** — filterable destination grid
3. **Destination detail** — flight/hotel picker with a sticky trip summary
4. **Booking** — passenger + payment form with a sticky order summary
5. **Confirmation** — boarding-pass-styled receipt

## What changed between wireframe and final build

| Wireframe block | Final decision |
|---|---|
| Generic hero placeholder | Interactive 3D globe (React Three Fiber) with destination markers + an orbiting paper plane — ties the hero directly to the booking domain instead of a stock photo |
| Plain list under hero | Departure-board component with live-status styling and staggered reveal animation |
| Generic "card" grid | Destination cards keep a fixed image/price/rating layout so scanning many results stays predictable |
| Flat form fields (booking) | Grouped into "Passenger details" / "Payment" sections with a persistent sticky summary, so total cost is visible while filling the form |
| Plain "success" screen | Boarding-pass component with a perforated tear line and stub, reusing the same component on the dashboard for booking history |

## Why this direction

The task is a travel *booking system* — the wireframes intentionally used
data-dense, row-based layouts (departure board, boarding pass) rather than
generic marketing blocks, because that's what the final aesthetic direction
(see main `README.md`) needed to encode: real flight/booking information as
the primary visual material, not decoration.
