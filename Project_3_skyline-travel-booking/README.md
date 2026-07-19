# Skyline — Travel Booking System

A full-stack MERN travel booking platform built for Rhombix Technologies —
Web Development Task 2. Search flights and hotels across eight destinations,
register/sign in, complete a booking with a mock payment flow, and receive a
real boarding-pass-styled confirmation.

## Design direction

The visual language is airport departure boards and boarding passes, not a
generic "travel blog" look — it's built from the vocabulary of the domain
itself:

- **Palette:** aviation navy, paper white, departure-board amber, runway teal
- **Type:** Space Grotesk (display), Inter (body), JetBrains Mono (flight
  numbers, prices, dates, confirmation codes)
- **Signature element:** an interactive 3D globe (React Three Fiber) with
  destination markers and an orbiting paper plane in the hero, a live-style
  departure board, and a torn boarding-pass confirmation card

## Tech stack

**Frontend:** React 19 + Vite, Tailwind CSS v4, Framer Motion, React Three
Fiber + drei, Zustand, React Router, Axios, lucide-react

**Backend:** Node.js + Express, JWT authentication, bcrypt password hashing,
Mongoose (MongoDB) with a built-in JSON-file mock storage mode so the app
runs immediately with zero database setup

## Project structure

```
skyline-travel/
├── server/            Express API
│   ├── src/
│   │   ├── config/     env + DB connection (mock/mongo switch)
│   │   ├── controllers/
│   │   ├── data/        seed catalog (destinations, hotels, flights) +
│   │   │                mock JSON storage + repository layer
│   │   ├── middleware/  JWT auth guard
│   │   ├── models/      Mongoose schemas (User, Booking)
│   │   └── routes/
│   └── .env.example
└── client/            React app (Vite)
    └── src/
        ├── components/  Navbar, Footer, Hero3D, DepartureBoard,
        │                DestinationCard, HotelCard, FlightCard,
        │                BoardingPass, SearchBar, ProtectedRoute
        ├── pages/       Home, Search, DestinationDetail, Booking,
        │                Confirmation, Login, Register, Dashboard
        ├── store/       Zustand auth store + trip store
        └── lib/         Axios API client / service layer
```

## Running it locally

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

The API runs on `http://localhost:5000`. By default `USE_MOCK=true` in
`.env`, so it stores users and bookings in `src/data/db.json` — **no
MongoDB required** to run or demo the app.

To use a real MongoDB database instead: set `USE_MOCK=false` and
`MONGO_URI=...` in `.env`. Every route, controller, and repository already
talks to a single abstraction layer (`src/data/userRepo.js` and
`bookingRepo.js`), so nothing else in the codebase needs to change.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` requests to the backend.

### 3. Try it out

- Register a new account, or sign in
- Search a destination, pick a flight + hotel, choose dates
- Complete checkout with any card number (try `4000 0000 0000 0002` to see a
  declined payment)
- View your boarding pass on the confirmation page and in **My trips**

## Feature checklist (per task brief)

- [x] Wireframe → polished, distinctive UI (departure board / boarding pass
      identity, not a template)
- [x] Structured database schema (`User`, `Booking`, plus a read-only
      catalog of destinations/hotels/flights)
- [x] Backend server-side infrastructure in Node.js/Express
- [x] Responsive front end in React + Tailwind
- [x] User registration, login, JWT-based authentication
- [x] Search + reservation flow (destinations → flights → hotels → booking)
- [x] Payment mechanism integration point (mock gateway, structured exactly
      where Stripe would plug in — see `bookingController.js`)

## Notes for submission

- `server/src/data/db.json` ships empty; it fills up as people use the app.
- Don't commit a real `.env` — only `.env.example` is tracked.
- `node_modules` are excluded from this delivery; run `npm install` in both
  `server/` and `client/` first.
