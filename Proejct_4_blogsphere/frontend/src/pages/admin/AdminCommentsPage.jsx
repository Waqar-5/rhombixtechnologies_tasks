import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFlag, FiEyeOff, FiEye, FiTrash2 } from 'react-icons/fi';
import { adminService } from '../../services/resourceServices';
import { PageLoader } from '../../components/ui/Spinner';
import { formatRelativeTime, getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdminCommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportedOnly, setReportedOnly] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const params = { limit: 50 };
      if (reportedOnly) params.isReported = true;
      const { data } = await adminService.getAllComments(params);
      setComments(data.data.comments);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [reportedOnly]);

  const handleToggleVisibility = async (comment) => {
    const newStatus = comment.status === 'visible' ? 'hidden' : 'visible';
    try {
      await adminService.updateCommentStatus(comment._id, newStatus);
      setComments((prev) => prev.map((c) => (c._id === comment._id ? { ...c, status: newStatus, isReported: false } : c)));
      toast.success(`Comment ${newStatus === 'hidden' ? 'hidden' : 'made visible'}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await adminService.deleteComment(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display text-3xl font-semibold text-ink">Comments</h1>
        <label className="flex items-center gap-2 text-sm text-ink-500">
          <input type="checkbox" checked={reportedOnly} onChange={(e) => setReportedOnly(e.target.checked)} className="rounded" />
          Reported only
        </label>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="mt-6 card divide-y divide-ink/[0.06]">
          {comments.map((c) => (
            <div key={c._id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-ink-400 font-mono">
                    <span className="font-medium text-ink-600">{c.author?.name}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(c.createdAt)}</span>
                    {c.isReported && <span className="flex items-center gap-1 text-rose"><FiFlag size={11} /> Reported</span>}
                    <span className={`px-2 py-0.5 rounded-full ${c.status === 'visible' ? 'bg-signal-50 text-signal' : 'bg-ink/[0.06] text-ink-400'}`}>{c.status}</span>
                  </div>
                  <p className="text-sm text-ink-700 mt-1.5">{c.content}</p>
                  {c.blog?.slug && (
                    <Link to={`/blogs/${c.blog.slug}`} className="text-xs text-signal hover:underline mt-1 inline-block">
                      on "{c.blog.title}"
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleToggleVisibility(c)} className="p-2 text-ink-400 hover:text-signal transition-colors" title="Toggle visibility">
                    {c.status === 'visible' ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="p-2 text-ink-400 hover:text-rose transition-colors" title="Delete">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="px-5 py-10 text-center text-sm text-ink-400">No comments to show.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminCommentsPage;
