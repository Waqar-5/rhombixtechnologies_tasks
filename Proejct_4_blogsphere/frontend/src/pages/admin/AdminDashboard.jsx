import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiFileText, FiMessageSquare, FiEye, FiHeart, FiFolder, FiTag } from 'react-icons/fi';
import { adminService } from '../../services/resourceServices';
import { PageLoader } from '../../components/ui/Spinner';
import { formatCount, formatDate, getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Card = ({ icon: Icon, label, value }) => (
  <div className="card p-5">
    <div className="w-9 h-9 rounded-full bg-signal-50 text-signal flex items-center justify-center mb-3">
      <Icon size={17} />
    </div>
    <p className="font-display text-2xl font-semibold text-ink">{formatCount(value)}</p>
    <p className="text-xs text-ink-400 mt-0.5">{label}</p>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then((res) => setData(res.data.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader />;
  if (!data) return null;

  const { cards, recentUsers, recentBlogs, recentComments } = data;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={FiUsers} label="Total users" value={cards.totalUsers} />
        <Card icon={FiFileText} label="Total blogs" value={cards.totalBlogs} />
        <Card icon={FiFileText} label="Published" value={cards.publishedBlogs} />
        <Card icon={FiFileText} label="Drafts" value={cards.draftBlogs} />
        <Card icon={FiMessageSquare} label="Comments" value={cards.totalComments} />
        <Card icon={FiFolder} label="Categories" value={cards.totalCategories} />
        <Card icon={FiTag} label="Tags" value={cards.totalTags} />
        <Card icon={FiEye} label="Total views" value={cards.totalViews} />
        <Card icon={FiHeart} label="Total likes" value={cards.totalLikes} />
        <Card icon={FiFileText} label="Pending review" value={cards.pendingBlogs} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-ink mb-3">Recent users</h2>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u._id} className="flex items-center justify-between text-sm">
                <span className="text-ink-600 truncate">{u.name}</span>
                <span className="text-xs font-mono text-ink-300">{formatDate(u.createdAt)}</span>
              </div>
            ))}
          </div>
          <Link to="/admin/users" className="text-xs text-signal font-medium hover:underline mt-3 inline-block">View all users</Link>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-ink mb-3">Recent blogs</h2>
          <div className="space-y-3">
            {recentBlogs.map((b) => (
              <div key={b._id} className="flex items-center justify-between text-sm">
                <span className="text-ink-600 truncate">{b.title}</span>
                <span className="text-xs font-mono text-ink-300">{b.views}v</span>
              </div>
            ))}
          </div>
          <Link to="/admin/blogs" className="text-xs text-signal font-medium hover:underline mt-3 inline-block">View all blogs</Link>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-ink mb-3">Recent comments</h2>
          <div className="space-y-3">
            {recentComments.map((c) => (
              <div key={c._id} className="text-sm">
                <p className="text-ink-600 truncate">{c.content}</p>
                <p className="text-xs font-mono text-ink-300">on "{c.blog?.title}"</p>
              </div>
            ))}
          </div>
          <Link to="/admin/comments" className="text-xs text-signal font-medium hover:underline mt-3 inline-block">Moderate comments</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
