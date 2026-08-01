import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Eye, PlusCircle, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { jobsApi } from '@/api/jobs';
import { useAuth } from '@/context/AuthContext';

export default function RecruiterOverview() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi
      .getAnalytics()
      .then((data) => setAnalytics(data.analytics))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}`}
        description="Here's how your hiring pipeline is performing."
        actions={
          <Button asChild>
            <Link to="/recruiter/jobs/new">
              <PlusCircle className="h-4 w-4" /> Post a job
            </Link>
          </Button>
        }
      />

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Open jobs" value={analytics?.openJobs ?? 0} icon={Briefcase} accent="primary" />
          <StatCard label="Total applicants" value={analytics?.totalApplications ?? 0} icon={Users} accent="secondary" />
          <StatCard label="Jobs posted" value={analytics?.totalJobs ?? 0} icon={Eye} accent="accent" />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display font-semibold">Your top performing jobs</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/recruiter/jobs">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <p className="p-5 text-sm text-muted-foreground">Loading…</p>
          ) : !analytics?.topJobs?.length ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">You haven't posted any jobs yet.</p>
              <Button size="sm" asChild>
                <Link to="/recruiter/jobs/new">Post your first job</Link>
              </Button>
            </div>
          ) : (
            analytics.topJobs.map((job) => (
              <div key={job._id} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-medium text-sm">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.views} views</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={job.status === 'open' ? 'success' : 'outline'}>{job.status}</Badge>
                  <span className="font-display font-semibold text-sm">{job.applicationsCount} applicants</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
