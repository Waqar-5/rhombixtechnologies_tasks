import { Search } from 'lucide-react';

const TAGS = [
  { id: '', label: 'All' },
  { id: 'beach', label: 'Beach' },
  { id: 'culture', label: 'Culture' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'nature', label: 'Nature' },
  { id: 'food', label: 'Food' },
  { id: 'budget', label: 'Budget' }
];

export default function SearchBar({ query, setQuery, tag, setTag }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3 rounded-lg border border-navy/10 bg-paper px-4 py-2.5">
        <Search className="h-4 w-4 text-navy/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city or country…"
          className="w-full bg-transparent text-sm text-navy placeholder:text-navy/40 focus:outline-none"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTag(t.id)}
            className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wide transition ${
              tag === t.id ? 'bg-navy text-paper' : 'bg-navy/5 text-navy/60 hover:bg-navy/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
