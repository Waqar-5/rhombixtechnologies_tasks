// Adapter for the Amadeus Self-Service Flight Offers Search API.
// Free tier, no prerequisites: https://developers.amadeus.com/register
//
// Requires AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in .env.
// If they are missing, or the live call fails for any reason (network,
// rate limit, no route found), callers should fall back to the local
// mock catalog — this module never throws for "not configured", it
// simply returns null so the caller can decide what to do.

const BASE_URL = 'https://test.api.amadeus.com';

// Live offers are ephemeral (Amadeus doesn't let you re-fetch by id), but
// a booking stores only a flightId reference and the app re-fetches full
// flight details later (e.g. on the dashboard). Cache normalized offers
// in memory for the life of the process so those lookups keep working.
const liveFlightCache = new Map();

export function getCachedLiveFlight(id) {
  return liveFlightCache.get(id) || null;
}

let cachedToken = null; // { value, expiresAt }

async function getAccessToken() {
  const { AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET } = process.env;
  if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
    return cachedToken.value;
  }

  const res = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: AMADEUS_CLIENT_ID,
      client_secret: AMADEUS_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`Amadeus auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

// Parses an ISO8601 duration like "PT7H30M" into decimal hours (7.5).
function parseIsoDurationToHours(iso) {
  if (!iso) return null;
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?$/.exec(iso);
  if (!match) return null;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  return Math.round((hours + minutes / 60) * 10) / 10;
}

function formatDepartTime(isoDateTime) {
  if (!isoDateTime) return null;
  const time = isoDateTime.split('T')[1];
  return time ? time.slice(0, 5) : null;
}

// Normalizes one Amadeus flight-offer into the shape the rest of the
// app already expects (see server/src/data/flights.json for reference).
function normalizeOffer(offer, dictionaries, destinationId) {
  const itinerary = offer.itineraries?.[0];
  const segments = itinerary?.segments || [];
  const first = segments[0];
  const last = segments[segments.length - 1];
  if (!first || !last) return null;

  const carrierCode = first.carrierCode;
  const carrierName = dictionaries?.carriers?.[carrierCode] || carrierCode;
  const cabin = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY';

  return {
    id: `amz_${offer.id}`,
    destinationId,
    airline: carrierName,
    flightNumber: `${carrierCode}${first.number}`,
    originCode: first.departure?.iataCode,
    originCity: first.departure?.iataCode,
    destinationCode: last.arrival?.iataCode,
    destinationCity: last.arrival?.iataCode,
    departTime: formatDepartTime(first.departure?.at),
    durationHours: parseIsoDurationToHours(itinerary.duration),
    stops: segments.length - 1,
    price: Math.round(Number(offer.price?.total || 0)),
    seatsAvailable: offer.numberOfBookableSeats ?? null,
    cabin: cabin.charAt(0) + cabin.slice(1).toLowerCase(),
    source: 'amadeus-live',
  };
}

/**
 * Searches live flight offers. Returns an array of normalized flights,
 * or null if the API isn't configured / the call failed — callers
 * should treat null as "fall back to local mock data".
 */
export async function searchLiveFlights({ originCode, destinationCode, departureDate, destinationId, adults = 1 }) {
  if (!originCode || !destinationCode) return null;

  try {
    const token = await getAccessToken();
    if (!token) return null;

    // Default to 30 days out if no date given — Amadeus requires a
    // future date and the test environment has thin near-term inventory.
    const date = departureDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    const params = new URLSearchParams({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: date,
      adults: String(adults),
      max: '10',
    });

    const res = await fetch(`${BASE_URL}/v2/shopping/flight-offers?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(`[amadeus] flight-offers ${res.status}: falling back to mock data`);
      return null;
    }

    const body = await res.json();
    const offers = (body.data || [])
      .map((offer) => normalizeOffer(offer, body.dictionaries, destinationId))
      .filter(Boolean);

    offers.forEach((offer) => liveFlightCache.set(offer.id, offer));

    return offers;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[amadeus] live search failed, falling back to mock data:', err.message);
    return null;
  }
}

export function isLiveFlightSearchConfigured() {
  return Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}
