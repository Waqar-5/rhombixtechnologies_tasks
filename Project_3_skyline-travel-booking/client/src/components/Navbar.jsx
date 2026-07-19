import { Link, useNavigate } from 'react-router-dom';
import { Plane, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-navy">
          <Plane className="h-5 w-5 text-amber" strokeWidth={2.5} />
          SKYLINE
        </Link>

        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-widest text-navy/70 md:flex">
          <Link to="/search" className="transition hover:text-amber-dim">Search</Link>
          {user && <Link to="/dashboard" className="transition hover:text-amber-dim">My trips</Link>}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <span className="font-mono text-xs text-navy/60">{user.name.split(' ')[0]}</span>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="rounded-full border border-navy/20 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-navy transition hover:border-navy hover:bg-navy hover:text-paper"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs font-medium uppercase tracking-wide text-navy/70 hover:text-navy">Sign in</Link>
              <Link
                to="/register"
                className="rounded-full bg-navy px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-paper transition hover:bg-navy-light"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-navy/10 bg-paper px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4 font-mono text-sm uppercase tracking-widest">
            <Link to="/search" onClick={() => setOpen(false)}>Search</Link>
            {user && <Link to="/dashboard" onClick={() => setOpen(false)}>My trips</Link>}
            {user ? (
              <button onClick={() => { logout(); setOpen(false); navigate('/'); }} className="text-left">Sign out</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
