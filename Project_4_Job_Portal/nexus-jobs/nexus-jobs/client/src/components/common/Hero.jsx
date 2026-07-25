import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Hero() {
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-radial-glow">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div
        className="absolute top-40 -right-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl animate-float"
        style={{ animationDelay: '1.5s' }}
      />

      <div className="container relative py-20 sm:py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border glass px-4 py-1.5 text-xs font-medium text-primary mb-6"
        >
          <Sparkles className="h-3.5 w-3.5" /> Trusted by 500+ growing teams
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-[1.1]"
        >
          Your next role is <span className="text-gradient">boarding now</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Nexus Jobs connects ambitious talent with teams building what's next. Search thousands of open
          roles from vetted, high-growth companies.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleSearch}
          className="mt-10 mx-auto max-w-2xl glass rounded-2xl border border-border p-2 flex flex-col sm:flex-row gap-2 shadow-glass-lg"
        >
          <div className="flex items-center flex-1 gap-2 px-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Job title, skill, or company"
              className="border-none shadow-none bg-transparent focus-visible:ring-0 h-10 px-0"
            />
          </div>
          <div className="hidden sm:block w-px bg-border my-2" />
          <div className="flex items-center flex-1 gap-2 px-3">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location or Remote"
              className="border-none shadow-none bg-transparent focus-visible:ring-0 h-10 px-0"
            />
          </div>
          <Button type="submit" size="lg" className="shrink-0">
            Search jobs <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          Popular:
          {['React', 'Product Design', 'Remote', 'DevOps'].map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/jobs?q=${encodeURIComponent(tag)}`)}
              className="rounded-full border border-border px-3 py-1 hover:border-primary hover:text-primary transition-colors"
            >
              {tag}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
