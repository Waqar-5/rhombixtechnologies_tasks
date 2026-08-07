import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiEye, FiHeart, FiMessageCircle, FiEdit3 } from 'react-icons/fi';
import { blogService } from '../../services/blogService';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/ui/Spinner';
import { formatCount } from '../../utils/formatters';

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="card p-5">
    <div className="w-9 h-9 rounded-full bg-signal-50 text-signal flex items-center justify-center mb-3">
      <Icon size={17} />
    </div>
    <p className="font-display text-2xl font-semibold text-ink">{formatCount(value)}</p>
    <p className="text-xs text-ink-400 mt-0.5">{label}</p>
  </div>
);

const DashboardHome = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    blogService.getMyBlogs({ limit: 100 }).then((res) => {
      setBlogs(res.data.data.blogs);
    }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader />;

  const published = blogs.filter((b) => b.status === 'published');
  const totalViews = published.reduce((sum, b) => sum + b.views, 0);
  const totalLikes = published.reduce((sum, b) => sum + b.likesCount, 0);
  const totalComments = published.reduce((sum, b) => sum + b.commentsCount, 0);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="text-sm text-ink-400 mt-1">Here's how your writing is doing.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard icon={FiFileText} label="Published posts" value={published.length} />
        <StatCard icon={FiEye} label="Total views" value={totalViews} />
        <StatCard icon={FiHeart} label="Total likes" value={totalLikes} />
        <StatCard icon={FiMessageCircle} label="Total comments" value={totalComments} />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Recent posts</h2>
        <Link to="/dashboard/write" className="btn-primary py-2 px-4 text-sm">
          <FiEdit3 size={14} /> New post
        </Link>
      </div>

      <div className="mt-4 divide-y divide-ink/[0.06] card">
        {blogs.slice(0, 5).map((blog) => (
          <Link key={blog._id} to={`/dashboard/write/${blog._id}`} className="flex items-center justify-between px-5 py-4 hover:bg-ink/[0.02] transition-colors">
            <div className="min-w-0">
              <p className="font-medium text-ink truncate">{blog.title}</p>
              <p className="text-xs text-ink-300 font-mono mt-0.5 capitalize">{blog.status}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-ink-400 font-mono shrink-0 ml-4">
              <span className="flex items-center gap-1"><FiEye size={12} /> {blog.views}</span>
              <span className="flex items-center gap-1"><FiHeart size={12} /> {blog.likesCount}</span>
            </div>
          </Link>
        ))}
        {blogs.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-ink-400">
            You haven't written anything yet. <Link to="/dashboard/write" className="text-signal font-medium hover:underline">Start your first post</Link>.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
