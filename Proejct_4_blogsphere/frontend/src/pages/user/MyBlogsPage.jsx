import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit3, FiTrash2, FiEye, FiPlus } from 'react-icons/fi';
import { blogService } from '../../services/blogService';
import { PageLoader } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  published: 'bg-signal-50 text-signal',
  draft: 'bg-ink/[0.06] text-ink-500',
  pending: 'bg-stamp/10 text-stamp-dark',
  rejected: 'bg-rose/10 text-rose',
};

const MyBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setIsLoading(true);
    try {
      const { data } = await blogService.getMyBlogs({ limit: 50 });
      setBlogs(data.data.blogs);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog permanently?')) return;
    try {
      await blogService.deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      toast.success('Blog deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const filtered = filter === 'all' ? blogs : blogs.filter((b) => b.status === filter);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display text-3xl font-semibold text-ink">My blogs</h1>
        <Link to="/dashboard/write" className="btn-primary py-2 px-4 text-sm">
          <FiPlus size={14} /> New post
        </Link>
      </div>

      <div className="flex gap-2 mt-6 mb-4">
        {['all', 'published', 'draft', 'pending', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === s ? 'bg-ink text-paper-light' : 'bg-ink/[0.05] text-ink-500 hover:bg-ink/[0.09]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FiEdit3}
          title="No blogs here yet"
          description="Posts matching this filter will show up here."
          action={<Link to="/dashboard/write" className="btn-primary">Write your first post</Link>}
        />
      ) : (
        <div className="card divide-y divide-ink/[0.06]">
          {filtered.map((blog) => (
            <div key={blog._id} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink truncate">{blog.title}</p>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[blog.status]}`}>
                    {blog.status}
                  </span>
                </div>
                <p className="text-xs text-ink-300 font-mono mt-1">{formatDate(blog.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {blog.status === 'published' && (
                  <Link to={`/blogs/${blog.slug}`} className="p-2 text-ink-400 hover:text-signal transition-colors">
                    <FiEye size={16} />
                  </Link>
                )}
                <Link to={`/dashboard/write/${blog._id}`} className="p-2 text-ink-400 hover:text-signal transition-colors">
                  <FiEdit3 size={16} />
                </Link>
                <button onClick={() => handleDelete(blog._id)} className="p-2 text-ink-400 hover:text-rose transition-colors">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBlogsPage;
