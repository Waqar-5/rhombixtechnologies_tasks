import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchLiveFlights, isLiveFlightSearchConfigured, getCachedLiveFlight } from '../services/amadeusService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

const destinations = JSON.parse(fs.readFileSync(path.join(dataDir, 'destinations.json'), 'utf-8'));
const hotels = JSON.parse(fs.readFileSync(path.join(dataDir, 'hotels.json'), 'utf-8'));
const flights = JSON.parse(fs.readFileSync(path.join(dataDir, 'flights.json'), 'utf-8'));

export function listDestinations(req, res) {
  const { q, tag } = req.query;
  let results = destinations;

  if (q) {
    const needle = q.toLowerCase();
    results = results.filter(
      (d) => d.city.toLowerCase().includes(needle) || d.country.toLowerCase().includes(needle)
    );
  }
  if (tag) {
    results = results.filter((d) => d.tags.includes(tag));
  }

  res.json({ results });
}

export function getDestination(req, res) {
  const destination = destinations.find((d) => d.id === req.params.id);
  if (!destination) return res.status(404).json({ message: 'Destination not found.' });
  res.json({ destination });
}

export function listHotels(req, res) {
  const { destinationId, maxPrice } = req.query;
  let results = hotels;

  if (destinationId) results = results.filter((h) => h.destinationId === destinationId);
  if (maxPrice) results = results.filter((h) => h.pricePerNight <= Number(maxPrice));

  res.json({ results });
}

export function getHotel(req, res) {
  const hotel = hotels.find((h) => h.id === req.params.id);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });
  res.json({ hotel });
}

export async function listFlights(req, res) {
  const { destinationId, originCode, maxPrice, cabin, departureDate } = req.query;

  // Try a live search first when the API is configured and we have
  // enough to build a real query (an origin + a resolvable destination).
  if (isLiveFlightSearchConfigured() && originCode && destinationId) {
    const destination = destinations.find((d) => d.id === destinationId);
    if (destination?.code) {
      const liveResults = await searchLiveFlights({
        originCode: originCode.toUpperCase(),
        destinationCode: destination.code,
        departureDate,
        destinationId,
      });
      if (liveResults && liveResults.length > 0) {
        let results = liveResults;
        if (maxPrice) results = results.filter((f) => f.price <= Number(maxPrice));
        if (cabin) results = results.filter((f) => f.cabin === cabin);
        return res.json({ results, source: 'amadeus-live' });
      }
      // liveResults is null (not configured/failed) or empty (no live
      // routes matched) — fall through to the local mock catalog below.
    }
  }

  let results = flights;

  if (destinationId) results = results.filter((f) => f.destinationId === destinationId);
  if (originCode) results = results.filter((f) => f.originCode === originCode.toUpperCase());
  if (maxPrice) results = results.filter((f) => f.price <= Number(maxPrice));
  if (cabin) results = results.filter((f) => f.cabin === cabin);

  res.json({ results, source: 'mock' });
}

export function getFlight(req, res) {
  const flight = flights.find((f) => f.id === req.params.id) || getCachedLiveFlight(req.params.id);
  if (!flight) return res.status(404).json({ message: 'Flight not found.' });
  res.json({ flight });
}

export function listOrigins(req, res) {
  const origins = [...new Map(flights.map((f) => [f.originCode, { code: f.originCode, city: f.originCity }])).values()];
  res.json({ results: origins });
}
