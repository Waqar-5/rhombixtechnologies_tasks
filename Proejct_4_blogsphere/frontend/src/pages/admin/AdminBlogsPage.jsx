import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import { adminService } from '../../services/resourceServices';
import { PageLoader } from '../../components/ui/Spinner';
import { formatDate, getErrorMessage } from '../../utils/formatters';
import { confirmToast, promiseToast } from '../../utils/toastHelpers';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  published: 'bg-signal-50 text-signal',
  draft: 'bg-ink/[0.06] text-ink-500',
  pending: 'bg-stamp/10 text-stamp-dark',
  rejected: 'bg-rose/10 text-rose',
};

const AdminBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setIsLoading(true);
    try {
      const params = { limit: 50 };
      if (filter !== 'all') params.status = filter;
      const { data } = await adminService.getAllBlogs(params);
      setBlogs(data.data.blogs);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleFeature = async (id) => {
    try {
      const { data } = await promiseToast(adminService.toggleFeature(id), {
        loading: 'Updating...',
        success: (res) => (res.data.data.blog.isFeatured ? 'Blog featured' : 'Blog unfeatured'),
      });
      setBlogs((prev) => prev.map((b) => (b._id === id ? { ...b, isFeatured: data.data.blog.isFeatured } : b)));
    } catch {
      // error toast already shown by promiseToast
    }
  };

  const handleApprove = async (id) => {
    try {
      await promiseToast(adminService.approveBlog(id), {
        loading: 'Approving...',
        success: 'Blog approved and published',
      });
      setBlogs((prev) => prev.map((b) => (b._id === id ? { ...b, status: 'published' } : b)));
    } catch {
      // error toast already shown by promiseToast
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):') || '';
    try {
      await promiseToast(adminService.rejectBlog(id, reason), {
        loading: 'Rejecting...',
        success: 'Blog rejected',
      });
      setBlogs((prev) => prev.map((b) => (b._id === id ? { ...b, status: 'rejected' } : b)));
    } catch {
      // error toast already shown by promiseToast
    }
  };

  const handleDelete = (id, title) => {
    confirmToast(`Delete "${title}"? This can't be undone.`, async () => {
      try {
        await promiseToast(adminService.deleteBlog(id), {
          loading: 'Deleting blog...',
          success: 'Blog deleted',
        });
        setBlogs((prev) => prev.filter((b) => b._id !== id));
      } catch {
        // error toast already shown by promiseToast
      }
    });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Blogs</h1>

      <div className="flex gap-2 mb-6">
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

      {isLoading ? <PageLoader /> : (
        <div className="card divide-y divide-ink/[0.06]">
          {blogs.map((blog) => (
            <div key={blog._id} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link to={`/blogs/${blog.slug}`} className="font-medium text-ink truncate hover:text-signal transition-colors">{blog.title}</Link>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[blog.status]}`}>{blog.status}</span>
                  {blog.isFeatured && <FiStar size={12} className="text-stamp fill-stamp shrink-0" />}
                </div>
                <p className="text-xs text-ink-300 font-mono mt-1">
                  {blog.author?.name} · {formatDate(blog.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {blog.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(blog._id)} className="p-2 text-ink-400 hover:text-signal transition-colors" title="Approve">
                      <FiCheck size={16} />
                    </button>
                    <button onClick={() => handleReject(blog._id)} className="p-2 text-ink-400 hover:text-rose transition-colors" title="Reject">
                      <FiX size={16} />
                    </button>
                  </>
                )}
                <button onClick={() => handleFeature(blog._id)} className={`p-2 transition-colors ${blog.isFeatured ? 'text-stamp' : 'text-ink-400 hover:text-stamp'}`} title="Toggle featured">
                  <FiStar size={16} className={blog.isFeatured ? 'fill-stamp' : ''} />
                </button>
                <button onClick={() => handleDelete(blog._id, blog.title)} className="p-2 text-ink-400 hover:text-rose transition-colors" title="Delete">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {blogs.length === 0 && <p className="px-5 py-10 text-center text-sm text-ink-400">No blogs match this filter.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminBlogsPage;
