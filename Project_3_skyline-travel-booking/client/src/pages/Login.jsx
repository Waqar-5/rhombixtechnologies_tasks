import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, status, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate(location.state?.from?.pathname || '/dashboard');
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <div className="text-center">
        <Plane className="mx-auto h-8 w-8 text-amber" />
        <h1 className="mt-3 font-display text-2xl font-semibold text-navy">Welcome back</h1>
        <p className="mt-1 text-sm text-navy/50">Sign in to view or book your trips.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block text-xs font-mono uppercase tracking-widest text-navy/50">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2 font-body text-sm text-navy normal-case focus:border-navy/40 focus:outline-none"
          />
        </label>
        <label className="block text-xs font-mono uppercase tracking-widest text-navy/50">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2 font-body text-sm text-navy normal-case focus:border-navy/40 focus:outline-none"
          />
        </label>

        {error && <p className="rounded-md bg-alert/10 px-4 py-2 text-sm text-alert">{error}</p>}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-full bg-navy py-3 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-navy-light disabled:opacity-60"
        >
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-navy/50">
        New here?{' '}
        <Link to="/register" className="font-medium text-teal hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
