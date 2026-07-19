import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <span className="font-mono text-xs uppercase tracking-widest text-teal">Flight cancelled</span>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">404 — Gate not found</h1>
      <p className="mt-2 text-sm text-navy/50">This page doesn't exist. Let's get you back on schedule.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-navy px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-paper">
        Back to home
      </Link>
    </div>
  );
}
