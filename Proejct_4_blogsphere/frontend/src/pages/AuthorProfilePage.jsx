import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiGlobe, FiGithub, FiLinkedin, FiTwitter, FiMapPin, FiBriefcase } from 'react-icons/fi';
import { userService } from '../services/resourceServices';
import { blogService } from '../services/blogService';
import BlogCard, { BlogCardSkeleton } from '../components/blog/BlogCard';
import { PageLoader } from '../components/ui/Spinner';
import { formatCount, getErrorMessage } from '../utils/formatters';
import toast from 'react-hot-toast';

const AuthorProfilePage = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [stats, setStats] = useState({ publishedBlogs: 0, totalViews: 0 });
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);

  useEffect(() => {
    userService.getAuthorProfile(id)
      .then((res) => {
        setAuthor(res.data.data.user);
        setStats(res.data.data.stats);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setIsLoading(false));

    blogService.getBlogs({ author: id, limit: 12, sort: 'latest' })
      .then((res) => setBlogs(res.data.data.blogs))
      .catch(() => {})
      .finally(() => setBlogsLoading(false));
  }, [id]);

  if (isLoading) return <PageLoader />;
  if (!author) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex flex-col sm:flex-row items-start gap-6 pb-10 border-b border-ink/10">
        <div className="w-24 h-24 rounded-full bg-signal-50 overflow-hidden flex items-center justify-center font-display text-3xl text-signal shrink-0">
          {author.avatar?.url ? <img src={author.avatar.url} alt="" className="w-full h-full object-cover" /> : author.name[0]}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold text-ink">{author.name}</h1>
          {author.occupation && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-400"><FiBriefcase size={13} /> {author.occupation}</p>
          )}
          {author.location && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-400"><FiMapPin size={13} /> {author.location}</p>
          )}
          {author.bio && <p className="mt-3 text-ink-600 font-body leading-relaxed max-w-xl">{author.bio}</p>}

          {author.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {author.skills.map((skill) => (
                <span key={skill} className="text-xs font-mono px-2.5 py-1 rounded-full bg-ink/[0.05] text-ink-500">{skill}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-4">
            {author.website && <a href={author.website} target="_blank" rel="noreferrer" className="text-ink-400 hover:text-signal"><FiGlobe size={17} /></a>}
            {author.github && <a href={author.github} target="_blank" rel="noreferrer" className="text-ink-400 hover:text-signal"><FiGithub size={17} /></a>}
            {author.linkedin && <a href={author.linkedin} target="_blank" rel="noreferrer" className="text-ink-400 hover:text-signal"><FiLinkedin size={17} /></a>}
            {author.twitter && <a href={author.twitter} target="_blank" rel="noreferrer" className="text-ink-400 hover:text-signal"><FiTwitter size={17} /></a>}
          </div>
        </div>
        <div className="flex gap-6 sm:flex-col sm:text-right shrink-0">
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{formatCount(stats.publishedBlogs)}</p>
            <p className="text-xs text-ink-400">Posts</p>
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{formatCount(stats.totalViews)}</p>
            <p className="text-xs text-ink-400">Views</p>
          </div>
        </div>
      </div>

      <h2 className="font-display text-2xl font-semibold text-ink mt-10 mb-6">Published stories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogsLoading
          ? Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={i} />)
          : blogs.length > 0
            ? blogs.map((b) => <BlogCard key={b._id} blog={b} />)
            : <p className="text-sm text-ink-400 col-span-full">No published posts yet.</p>}
      </div>
    </div>
  );
};

export default AuthorProfilePage;
