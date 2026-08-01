import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, MapPin, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import { companiesApi } from '@/api/companies';
import toast from 'react-hot-toast';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      companiesApi
        .getAll({ q, page, limit: 12 })
        .then((data) => {
          setCompanies(data.companies);
          setPagination(data.pagination);
        })
        .catch((error) => toast.error(error.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [q, page]);

  return (
    <div className="container py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-bold">Companies hiring on Nexus Jobs</h1>
      <p className="text-sm text-muted-foreground mt-1">Explore team culture, size, and open roles before you apply.</p>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search companies"
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState icon={Building2} title="No companies found" description="Try a different search term." />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {companies.map((c) => (
              <Link
                key={c._id}
                to={`/companies/${c.slug}`}
                className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-glass transition-all"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={c.logo?.url} name={c.name} size="lg" className="rounded-2xl" />
                  <div className="min-w-0">
                    <p className="font-display font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.industry}</p>
                  </div>
                </div>
                {c.tagline && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{c.tagline}</p>}
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  {c.headquarters && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {c.headquarters}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {c.jobCount || 0} open roles
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} pages={pagination.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
