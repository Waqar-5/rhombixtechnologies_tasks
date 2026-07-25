import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, MapPin, Users, Calendar, Briefcase } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import JobCard from '@/components/jobs/JobCard';
import EmptyState from '@/components/common/EmptyState';
import { companiesApi } from '@/api/companies';
import toast from 'react-hot-toast';

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
      <div className="h-48 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-glow opacity-40" />
        {company.coverImage?.url && (
          <img src={company.coverImage.url} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="container -mt-10 pb-16">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-glass-lg">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar
              src={company.logo?.url}
              name={company.name}
              size="xl"
              className="rounded-2xl border-4 border-card -mt-16 sm:-mt-20 shrink-0 shadow-glass-lg"
            />
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="font-display text-2xl font-bold">{company.name}</h1>
              {company.tagline && <p className="text-muted-foreground mt-1">{company.tagline}</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {company.headquarters && (
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {company.headquarters}</span>
                )}
                {company.companySize && (
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {company.companySize} employees</span>
                )}
                {company.founded && (
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Founded {company.founded}</span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
              </div>
              {company.industry && <Badge className="mt-3">{company.industry}</Badge>}
            </div>
          </div>

          {company.description && (
            <div className="mt-6 pt-6 border-t border-border">
              <h2 className="font-display font-semibold text-lg mb-2">About {company.name}</h2>
              <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{company.description}</p>
            </div>
          )}

          {company.perks?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h2 className="font-display font-semibold text-lg mb-3">Perks & benefits</h2>
              <div className="flex flex-wrap gap-2">
                {company.perks.map((p) => (
                  <Badge key={p} variant="outline">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" /> Open roles ({jobs.length})
          </h2>
          {jobs.length === 0 ? (
            <EmptyState icon={Briefcase} title="No open roles right now" description="Check back soon for new opportunities." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map((job) => (
                <JobCard key={job._id} job={{ ...job, company }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
