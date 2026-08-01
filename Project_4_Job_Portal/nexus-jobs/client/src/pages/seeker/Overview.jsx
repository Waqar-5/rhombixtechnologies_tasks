import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Bookmark, Bell, ArrowRight, Sparkles } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { applicationsApi } from '@/api/applications';
import { savedJobsApi } from '@/api/savedJobs';
import { useAuth } from '@/context/AuthContext';
import { statusColors, formatRelativeDate } from '@/lib/utils';

export default function SeekerOverview() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([applicationsApi.getMine({ limit: 5 }), savedJobsApi.getAll({ limit: 1 })])
      .then(([appsRes, savedRes]) => {
        setApplications(appsRes.applications);
        setSavedCount(savedRes.pagination.total);
      })
      .finally(() => setLoading(false));
  }, []);

  const profileComplete = Boolean(user?.headline && user?.resume?.url && user?.skills?.length);

  return (
    <div>
      <PageHeader title={`Welcome back, ${user?.name?.split(' ')[0]}`} description="Here's what's happening with your job search." />

      {!profileComplete && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-center gap-4 flex-wrap">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="font-medium text-sm">Complete your profile to apply faster</p>
            <p className="text-xs text-muted-foreground">Add a headline, skills, and resume to unlock one-click apply.</p>
          </div>
          <Button size="sm" asChild>
            <Link to="/seeker/profile">Complete profile</Link>
          </Button>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Applications sent" value={applications.length ? applications.length : 0} icon={FileText} accent="primary" />
        <StatCard label="Saved jobs" value={savedCount} icon={Bookmark} accent="secondary" />
        <StatCard label="Profile status" value={profileComplete ? 'Complete' : 'Incomplete'} icon={Bell} accent={profileComplete ? 'success' : 'accent'} />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display font-semibold">Recent applications</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/seeker/applications">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <p className="p-5 text-sm text-muted-foreground">Loading…</p>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">You haven't applied to any jobs yet.</p>
              <Button size="sm" asChild>
                <Link to="/jobs">Browse jobs</Link>
              </Button>
            </div>
          ) : (
            applications.map((app) => (
              <Link
                key={app._id}
                to={`/jobs/${app.job?.slug}`}
                className="flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors"
              >
                <Avatar src={app.job?.company?.logo?.url} name={app.job?.company?.name} className="rounded-xl" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{app.job?.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{app.job?.company?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge className={statusColors[app.status]}>{app.status.replace('-', ' ')}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(app.createdAt)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
