import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { blogService } from '../services/blogService';
import { categoryService } from '../services/resourceServices';
import BlogCard, { BlogCardSkeleton } from '../components/blog/BlogCard';
import EmptyState from '../components/ui/EmptyState';
import { getErrorMessage } from '../utils/formatters';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most-viewed', label: 'Most viewed' },
  { value: 'most-liked', label: 'Most liked' },
  { value: 'trending', label: 'Trending' },
];

const BlogsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page'), 10) || 1;
  const sort = searchParams.get('sort') || 'latest';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const featured = searchParams.get('featured') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    categoryService.getCategories({ limit: 50, sort: 'name' }).then((res) => {
      setCategories(res.data.data.categories);
    }).catch(() => {});
  }, []);

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 9, sort };
      if (category) params.category = category;
      if (tag) params.tag = tag;
      if (featured) params.featured = featured;
      if (search) params.search = search;

      const { data } = await blogService.getBlogs(params);
      setBlogs(data.data.blogs);
      setMeta(data.meta);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, sort, category, tag, featured, search]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="eyebrow">Library</span>
        <h1 className="mt-1 font-display text-4xl font-semibold text-ink">
          {featured ? 'Featured stories' : search ? `Results for "${search}"` : tag ? `#${tag}` : 'All blogs'}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-10">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, content, or author..."
            className="input pl-11"
          />
        </form>

        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="btn-secondary lg:hidden"
        >
          <FiFilter size={15} /> Filters
        </button>

        <div className={`${filtersOpen ? 'flex' : 'hidden'} lg:flex flex-wrap gap-3`}>
          <select
            value={category}
            onChange={(e) => updateParam('category', e.target.value)}
            className="input w-auto py-2"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="input w-auto py-2"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => <BlogCardSkeleton key={i} />)}
        </div>
      ) : blogs.length === 0 ? (
        <EmptyState
          icon={FiSearch}
          title="No stories found"
          description="Try a different search term or clear your filters."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: meta.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                    meta.page === i + 1
                      ? 'bg-signal text-paper-light'
                      : 'text-ink-500 hover:bg-ink/[0.05]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogsPage;
