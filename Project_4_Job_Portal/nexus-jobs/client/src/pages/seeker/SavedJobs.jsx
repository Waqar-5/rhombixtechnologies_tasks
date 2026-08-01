import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import JobCard from '@/components/jobs/JobCard';
import JobCardSkeleton from '@/components/jobs/JobCardSkeleton';
import { savedJobsApi } from '@/api/savedJobs';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    savedJobsApi
      .getAll({ page, limit: 9 })
      .then((data) => {
        setSavedJobs(data.savedJobs);
        setPagination(data.pagination);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleUnsave = async (jobId) => {
    try {
      await savedJobsApi.unsave(jobId);
      setSavedJobs((prev) => prev.filter((s) => s.job._id !== jobId));
      toast.success('Removed from saved jobs');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <PageHeader title="Saved jobs" description="Roles you've bookmarked to revisit later." />

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Tap the bookmark icon on any job to save it here for later."
          actionLabel="Browse jobs"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {savedJobs.map((s) => (
              <JobCard key={s._id} job={s.job} isSaved onToggleSave={handleUnsave} />
            ))}
          </div>
          <Pagination page={page} pages={pagination.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
