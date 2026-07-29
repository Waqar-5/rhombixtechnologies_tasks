import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, MapPin, Users, Calendar, Briefcase, BadgeCheck, Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import JobCard from '@/components/jobs/JobCard';
import EmptyState from '@/components/common/EmptyState';
import { companiesApi } from '@/api/companies';
import toast from 'react-hot-toast';

const MetaChip = ({ icon: Icon, children, href }) => {
  const classes =
    'inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground';
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${classes} text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors`}
      >
        <Icon className="h-3.5 w-3.5" /> {children}
      </a>
    );
  }
  return (
    <span className={classes}>
      <Icon className="h-3.5 w-3.5" /> {children}
    </span>
  );
};

export default function CompanyProfile() {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesApi
      .getBySlug(slug)
      .then((data) => {
        setCompany(data.company);
        setJobs(data.jobs);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-40 w-full rounded-2xl mb-6" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (!company) return null;

  return (
    <div>
      {/* Cover banner — gradient + floating glow orbs + dot texture, so it never reads as an empty block */}
      <div className="h-56 sm:h-64 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-glow opacity-50" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '22px 22px'
          }}
        />
        <div className="absolute -top-10 left-1/4 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-white/10 blur-3xl animate-float"
          style={{ animationDelay: '1.2s' }}
        />
        {company.coverImage?.url && (
          <img src={company.coverImage.url} alt="" className="h-full w-full object-cover relative" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/40 to-transparent" />
      </div>

      <div className="container -mt-12 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-glass-lg"
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Gradient-ring avatar frame — more premium than a flat border */}
            <div className="-mt-4 sm:-mt-8 shrink-0 rounded-2xl bg-gradient-primary p-1 shadow-glass-lg">
              <div className="rounded-[14px] bg-card p-1">
                <Avatar src={company.logo?.url} name={company.name} size="xl" className="rounded-xl" />
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-bold">{company.name}</h1>
                {company.isVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
              {company.tagline && <p className="text-muted-foreground mt-1.5">{company.tagline}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                {company.headquarters && <MetaChip icon={MapPin}>{company.headquarters}</MetaChip>}
                {company.companySize && <MetaChip icon={Users}>{company.companySize} employees</MetaChip>}
                {company.founded && <MetaChip icon={Calendar}>Founded {company.founded}</MetaChip>}
                {company.website && (
                  <MetaChip icon={Globe} href={company.website}>
                    Website
                  </MetaChip>
                )}
              </div>

              {company.industry && (
                <Badge className="mt-4" variant="secondary">
                  {company.industry}
                </Badge>
              )}
            </div>
          </div>

          {company.description && (
            <div className="mt-8 pt-6 border-t border-border">
              <h2 className="font-display font-semibold text-lg mb-2">About {company.name}</h2>
              <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{company.description}</p>
            </div>
          )}

          {company.perks?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-accent" size={18} /> Perks & benefits
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.perks.map((p) => (
                  <Badge key={p} variant="outline">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-10"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="h-4.5 w-4.5" size={18} />
            </div>
            <h2 className="font-display text-xl font-bold">Open roles</h2>
            <Badge variant="secondary">{jobs.length}</Badge>
          </div>
          {jobs.length === 0 ? (
            <EmptyState icon={Briefcase} title="No open roles right now" description="Check back soon for new opportunities." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map((job) => (
                <JobCard key={job._id} job={{ ...job, company }} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
