import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, ShieldCheck, Zap, Users } from 'lucide-react';

const perks = [
  { icon: Zap, text: 'One-click apply with your saved resume' },
  { icon: Users, text: 'Direct pipeline into 500+ hiring teams' },
  { icon: ShieldCheck, text: 'Your data is never sold to third parties' }
];

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-primary text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-glow opacity-50" />
        <Link to="/" className="relative flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Briefcase className="h-4.5 w-4.5" size={18} />
          </span>
          <span className="font-display text-lg font-bold">Nexus Jobs</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <h2 className="font-display text-4xl font-bold leading-tight max-w-md">
            Your career, boarding at the next gate.
          </h2>
          <div className="mt-8 space-y-4">
            {perks.map((p) => (
              <div key={p.text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur shrink-0">
                  <p.icon className="h-4.5 w-4.5" size={18} />
                </div>
                <p className="text-sm text-white/90">{p.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} Nexus Jobs</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
              <Briefcase className="h-4.5 w-4.5 text-white" size={18} />
            </span>
            <span className="font-display text-lg font-bold">Nexus Jobs</span>
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
