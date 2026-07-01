import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(identifier, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-ink)] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="pulse-dot is-coral" />
          <span className="font-display text-3xl font-bold">Pulse</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">Log in to keep up with your network.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email or username</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
                className="w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[var(--color-coral)] text-white font-semibold disabled:opacity-50 hover:bg-[var(--color-coral-soft)] transition-colors"
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-[var(--color-text-muted)] text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--color-coral)] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-xs text-[var(--color-text-muted)] text-center mt-4">
          Demo accounts (if seeded): waqar / ayesha / bilal — password: password123
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
