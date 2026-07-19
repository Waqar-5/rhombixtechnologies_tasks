import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, status, error } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await register(name, email, password);
    if (ok) navigate('/dashboard');
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <div className="text-center">
        <Plane className="mx-auto h-8 w-8 text-amber" />
        <h1 className="mt-3 font-display text-2xl font-semibold text-navy">Create your account</h1>
        <p className="mt-1 text-sm text-navy/50">Book trips and keep every boarding pass in one place.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block text-xs font-mono uppercase tracking-widest text-navy/50">
          Full name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2 font-body text-sm text-navy normal-case focus:border-navy/40 focus:outline-none"
          />
        </label>
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
            minLength={6}
            className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2 font-body text-sm text-navy normal-case focus:border-navy/40 focus:outline-none"
          />
        </label>

        {error && <p className="rounded-md bg-alert/10 px-4 py-2 text-sm text-alert">{error}</p>}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-full bg-navy py-3 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-navy-light disabled:opacity-60"
        >
          {status === 'loading' ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-navy/50">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-teal hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
