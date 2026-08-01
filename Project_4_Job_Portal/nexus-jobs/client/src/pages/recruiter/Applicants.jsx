import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Users, FileText, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { applicationsApi } from '@/api/applications';
import { statusColors, formatRelativeDate, getFileUrl } from '@/lib/utils';

const statusOptions = ['applied', 'in-review', 'shortlisted', 'interview', 'rejected', 'hired'];

export default function RecruiterApplicants() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const fetcher = jobId
      ? applicationsApi.getForJob(jobId, { page, limit: 10 })
      : applicationsApi.getAllForRecruiter({ page, limit: 10 });

    fetcher
      .then((data) => {
        setApplications(data.applications);
        setPagination(data.pagination);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [jobId, page]);

  const handleStatusChange = async (id, status) => {
    try {
      await applicationsApi.updateStatus(id, { status });
      setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
      toast.success('Status updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <PageHeader title="Applicants" description="Review and move candidates through your hiring pipeline." />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState icon={Users} title="No applicants yet" description="Once candidates apply, they'll show up here." />
      ) : (
        <>
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app._id} className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar src={app.applicant?.avatar?.url} name={app.applicant?.name} className="rounded-xl" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{app.applicant?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {app.applicant?.headline || app.applicant?.email}
                  </p>
                  {app.job?.title && !jobId && (
                    <Link to={`/jobs/${app.job.slug}`} className="text-xs text-primary hover:underline mt-0.5 inline-block">
                      Applied for {app.job.title}
                    </Link>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Applied {formatRelativeDate(app.createdAt)}</p>
                </div>

                <a
                  href={getFileUrl(app.resumeSnapshot?.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline shrink-0"
                >
                  <FileText className="h-3.5 w-3.5" /> Resume <ExternalLink className="h-3 w-3" />
                </a>

                <Select value={app.status} onValueChange={(v) => handleStatusChange(app._id, v)}>
                  <SelectTrigger className="w-40 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Badge className={`shrink-0 ${statusColors[app.status]}`}>{app.status.replace('-', ' ')}</Badge>
              </div>
            ))}
          </div>
          <Pagination page={page} pages={pagination.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
