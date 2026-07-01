import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Pulse.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
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
          <h1 className="font-display text-xl font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">Join the network. It only takes a minute.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
                className="w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)]"
                placeholder="Waqar Ahmed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                pattern="^[a-zA-Z0-9_.]+$"
                title="Letters, numbers, underscores and dots only"
                className="w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)]"
                placeholder="waqar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)]"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[var(--color-coral)] text-white font-semibold disabled:opacity-50 hover:bg-[var(--color-coral-soft)] transition-colors"
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="text-sm text-[var(--color-text-muted)] text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-coral)] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
