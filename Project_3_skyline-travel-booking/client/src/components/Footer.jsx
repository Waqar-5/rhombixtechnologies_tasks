import { Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-navy text-paper/70">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-paper">
              <Plane className="h-4 w-4 text-amber" />
              SKYLINE
            </div>
            <p className="mt-2 max-w-xs text-sm text-paper/50">
              Flights, stays, and everything between — booked in one pass.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 font-mono text-xs uppercase tracking-widest text-paper/50 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <span className="text-amber/80">Explore</span>
              <Link to="/search" className="hover:text-paper">Destinations</Link>
              <Link to="/search" className="hover:text-paper">Flights</Link>
              <Link to="/search" className="hover:text-paper">Hotels</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-amber/80">Account</span>
              <Link to="/dashboard" className="hover:text-paper">My trips</Link>
              <Link to="/login" className="hover:text-paper">Sign in</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-amber/80">Status</span>
              <span>All systems on time</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-paper/10 pt-6 text-xs text-paper/40">
          © {new Date().getFullYear()} Skyline Travel. Built for demonstration purposes.
        </div>
      </div>
    </footer>
  );
}
