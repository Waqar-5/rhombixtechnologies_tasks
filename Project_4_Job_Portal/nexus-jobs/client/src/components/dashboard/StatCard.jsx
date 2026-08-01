import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StatCard({ label, value, icon: Icon, trend, accent = 'primary' }) {
  const accents = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/15 text-accent-foreground',
    success: 'bg-success/10 text-success'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && (
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', accents[accent])}>
            <Icon className="h-4.5 w-4.5" size={18} />
          </div>
        )}
      </div>
      <p className="font-display text-3xl font-bold mt-2">{value}</p>
      {trend && <p className="text-xs text-success mt-1">{trend}</p>}
    </motion.div>
  );
}
