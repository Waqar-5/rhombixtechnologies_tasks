import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Bookmark, BookmarkCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn, formatSalary, formatRelativeDate, jobTypeLabels, workModeLabels } from '@/lib/utils';

export default function JobCard({ job, isSaved, onToggleSave, className }) {
  const company = job.company || {};

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={cn(
        'boarding-pass group relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-glass-lg hover:border-primary/30 transition-colors',
        className
      )}
    >
      <Link to={`/jobs/${job.slug}`} className="absolute inset-0 z-10" aria-label={job.title} />

      {/* Logo stub */}
      <div className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-radial-glow">
        <Avatar src={company.logo?.url} name={company.name} size="lg" className="rounded-2xl" />
        {job.isFeatured && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-accent uppercase tracking-wide">
            <Zap className="h-3 w-3 fill-accent" /> Featured
          </span>
        )}
      </div>

      <div className="perforation" />

      {/* Details */}
      <div className="p-5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-base leading-snug truncate group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{company.name}</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave?.(job._id);
            }}
            className="relative z-20 shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label={isSaved ? 'Unsave job' : 'Save job'}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" /> {jobTypeLabels[job.jobType]}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="outline">{workModeLabels[job.workMode]}</Badge>
          {job.skills?.slice(0, 2).map((skill) => (
            <Badge key={skill} variant="default">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-sm font-semibold text-foreground">
            {job.salary?.isPublic !== false ? formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency) : 'Salary not disclosed'}
          </span>
          <span className="text-xs text-muted-foreground">{formatRelativeDate(job.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}
