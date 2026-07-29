import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Briefcase, Eye, Users, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { jobsApi } from '@/api/jobs';
import { formatRelativeDate, jobTypeLabels } from '@/lib/utils';

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'draft', label: 'Draft' },
  { value: 'closed', label: 'Closed' }
];

export default function RecruiterJobsList() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    jobsApi
      .getMine({ status, page, limit: 10 })
      .then((data) => {
        setJobs(data.jobs);
        setPagination(data.pagination);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, page]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await jobsApi.remove(deleteTarget._id);
      toast.success('Job deleted');
      setDeleteTarget(null);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await jobsApi.update(job._id, { status: nextStatus });
      toast.success(`Job marked as ${nextStatus}`);
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Your job postings"
        description="Manage, edit, and track every role you've published."
        actions={
          <Button asChild>
            <Link to="/recruiter/jobs/new">
              <PlusCircle className="h-4 w-4" /> Post a job
            </Link>
          </Button>
        }
      />

      <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} className="mb-6">
        <TabsList>
          {statusTabs.map((t) => (
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
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Post your first role to start receiving applications."
          actionLabel="Post a job"
          onAction={() => (window.location.href = '/recruiter/jobs/new')}
        />
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id} className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/jobs/${job.slug}`} className="font-medium text-sm hover:text-primary">
                      {job.title}
                    </Link>
                    <Badge variant={job.status === 'open' ? 'success' : job.status === 'draft' ? 'outline' : 'destructive'}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                    <span>{job.category?.name}</span>
                    <span>{jobTypeLabels[job.jobType]}</span>
                    <span>Posted {formatRelativeDate(job.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {job.views}</span>
                  <Link to={`/recruiter/jobs/${job._id}/applicants`} className="flex items-center gap-1 hover:text-primary">
                    <Users className="h-3.5 w-3.5" /> {job.applicationsCount}
                  </Link>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(job)}>
                    {job.status === 'open' ? 'Close' : 'Reopen'}
                  </Button>
                  <Button variant="ghost" size="icon" asChild aria-label={`Edit ${job.title}`}>
                    <Link to={`/recruiter/jobs/${job._id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(job)} aria-label={`Delete ${job.title}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} pages={pagination.pages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this job?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" and all ${deleteTarget.applicationsCount || 0} of its applications will be permanently deleted. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete job"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
