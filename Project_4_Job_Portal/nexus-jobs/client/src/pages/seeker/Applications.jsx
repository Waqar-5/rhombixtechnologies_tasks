import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MapPin, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { applicationsApi } from '@/api/applications';
import { statusColors, formatRelativeDate } from '@/lib/utils';

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'applied', label: 'Applied' },
  { value: 'in-review', label: 'In review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' }
];

export default function SeekerApplications() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [loading, setLoading] = useState(true);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const load = () => {
    setLoading(true);
    applicationsApi
      .getMine({ status, page, limit: 8 })
      .then((data) => {
        setApplications(data.applications);
        setPagination(data.pagination);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, page]);

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      await applicationsApi.withdraw(withdrawTarget._id);
      toast.success('Application withdrawn');
      setWithdrawTarget(null);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div>
      <PageHeader title="My applications" description="Track the status of every job you've applied to." />

      <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} className="mb-6">
        <TabsList className="flex-wrap h-auto">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications here"
          description="Applications you submit will show up here so you can track their progress."
          actionLabel="Browse jobs"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <>
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <Avatar src={app.job?.company?.logo?.url} name={app.job?.company?.name} className="rounded-xl" />
                <div className="flex-1 min-w-0">
                  <Link to={`/jobs/${app.job?.slug}`} className="font-medium text-sm hover:text-primary truncate block">
                    {app.job?.title}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">{app.job?.company?.name}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    {app.job?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {app.job.location}
                      </span>
                    )}
                    <span>Applied {formatRelativeDate(app.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={statusColors[app.status]}>{app.status.replace('-', ' ')}</Badge>
                  {['applied', 'in-review'].includes(app.status) && (
                    <Button variant="ghost" size="icon" onClick={() => setWithdrawTarget(app)} aria-label="Withdraw">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} pages={pagination.pages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(withdrawTarget)}
        onOpenChange={(open) => !open && setWithdrawTarget(null)}
        title="Withdraw this application?"
        description={
          withdrawTarget
            ? `Your application for "${withdrawTarget.job?.title}" will be permanently withdrawn. This cannot be undone.`
            : ''
        }
        confirmLabel="Withdraw"
        loading={withdrawing}
        onConfirm={confirmWithdraw}
      />
    </div>
  );
}
