import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';
import JobCardSkeleton from '@/components/jobs/JobCardSkeleton';
import JobFilters from '@/components/jobs/JobFilters';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@/api/jobs';
import { categoriesApi } from '@/api/categories';
import { savedJobsApi } from '@/api/savedJobs';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const { isAuthenticated, isJobseeker } = useAuth();

  const filters = {
    q: searchParams.get('q') || '',
    jobType: searchParams.get('jobType') || 'all',
    workMode: searchParams.get('workMode') || 'all',
    experienceLevel: searchParams.get('experienceLevel') || 'all',
    category: searchParams.get('category') || 'all',
    sort: searchParams.get('sort') || 'relevant',
    page: Number(searchParams.get('page')) || 1
  };

  // Local, immediately-editable copy of the search box. The URL (and the
  // actual API call) only updates after the person pauses typing, so each
  // keystroke doesn't trigger a fresh request.
  const [searchInput, setSearchInput] = useState(filters.q);

  const updateFilters = (next) => {
    const params = {};
    Object.entries(next).forEach(([key, value]) => {
      if (value && value !== 'all') params[key] = value;
    });
    setSearchParams(params);
  };

  useEffect(() => {
    if (searchInput === filters.q) return;
    const timeout = setTimeout(() => {
      updateFilters({ ...filters, q: searchInput, page: 1 });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('q')]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 9 };
      Object.keys(params).forEach((k) => (params[k] === 'all' || !params[k]) && delete params[k]);
      const data = await jobsApi.getJobs(params);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    categoriesApi.getAll().then((data) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated && isJobseeker) {
      savedJobsApi
        .getAll({ limit: 100 })
        .then((data) => setSavedIds(new Set(data.savedJobs.map((s) => s.job._id))))
        .catch(() => {});
    }
  }, [isAuthenticated, isJobseeker]);

  const toggleSave = async (jobId) => {
    if (!isAuthenticated || !isJobseeker) {
      toast.error('Log in as a job seeker to save jobs');
      return;
    }
    try {
      if (savedIds.has(jobId)) {
        await savedJobsApi.unsave(jobId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await savedJobsApi.save(jobId);
        setSavedIds((prev) => new Set(prev).add(jobId));
        toast.success('Job saved');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Find your next role</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? 'Searching…' : `${pagination.total} open roles matching your criteria`}
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, skill, or location"
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="lg:hidden" onClick={() => setShowMobileFilters(true)}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <div className="hidden lg:block">
          <JobFilters filters={filters} onChange={updateFilters} categories={categories} />
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-background p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold">Filters</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <JobFilters filters={filters} onChange={updateFilters} categories={categories} />
            </div>
          </div>
        )}

        <div>
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No jobs match your filters"
              description="Try broadening your search or clearing some filters."
              actionLabel="Clear filters"
              onAction={() => updateFilters({ page: 1 })}
            />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} isSaved={savedIds.has(job._id)} onToggleSave={toggleSave} />
                ))}
              </div>
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onPageChange={(p) => updateFilters({ ...filters, page: p })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
