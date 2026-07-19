import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import DestinationCard from '../components/DestinationCard';
import { catalogService } from '../lib/api';

export default function Search() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [tag, setTag] = useState(params.get('tag') || '');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      catalogService
        .destinations({ q: query || undefined, tag: tag || undefined })
        .then(setDestinations)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, tag]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <span className="font-mono text-xs uppercase tracking-widest text-teal">Search</span>
      <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Find your next departure</h1>

      <div className="mt-6 max-w-xl">
        <SearchBar query={query} setQuery={setQuery} tag={tag} setTag={setTag} />
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="font-mono text-sm text-navy/40">Searching…</p>
        ) : destinations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-navy/20 p-12 text-center">
            <p className="font-display text-lg text-navy">No destinations match that search.</p>
            <p className="mt-1 text-sm text-navy/50">Try a different city, country, or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
