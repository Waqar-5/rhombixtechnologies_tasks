import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiHeart, FiBookmark, FiShare2, FiEye, FiMessageCircle, FiEdit2, FiTrash2,
} from 'react-icons/fi';
import { blogService } from '../services/blogService';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatCount, getErrorMessage } from '../utils/formatters';
import BlogCard from '../components/blog/BlogCard';
import CommentSection from '../components/comment/CommentSection';
import { PageLoader } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const SingleBlogPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { data } = await blogService.getBlogBySlug(slug);
        setBlog(data.data.blog);
        setLiked(data.data.isLikedByMe);
        setBookmarked(data.data.isBookmarkedByMe);
        setLikesCount(data.data.blog.likesCount);

        blogService.getRelatedBlogs(slug).then((res) => setRelated(res.data.data.blogs)).catch(() => {});
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/blogs');
      } finally {
        setIsLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error('Log in to like this post');
    try {
      const { data } = await blogService.toggleLike(blog._id);
      setLiked(data.data.liked);
      setLikesCount(data.data.likesCount);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return toast.error('Log in to bookmark this post');
    try {
      const { data } = await blogService.toggleBookmark(blog._id);
      setBookmarked(data.data.bookmarked);
      toast.success(data.data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: blog.title, url }); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this blog permanently? This cannot be undone.')) return;
    try {
      await blogService.deleteBlog(blog._id);
      toast.success('Blog deleted');
      navigate('/dashboard/my-blogs');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) return <PageLoader />;
  if (!blog) return null;

  const isOwnerOrAdmin = user && (String(user._id) === String(blog.author._id) || user.role === 'admin');

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        {blog.category?.name && (
          <Link to={`/blogs?category=${blog.category.slug}`} className="eyebrow hover:underline">
            {blog.category.name}
          </Link>
        )}
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.1]">
          {blog.title}
        </h1>
        {blog.excerpt && <p className="mt-4 text-lg text-ink-400 font-body leading-relaxed">{blog.excerpt}</p>}

        <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
          <Link to={`/authors/${blog.author._id}`} className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-signal-50 overflow-hidden flex items-center justify-center font-display text-signal">
              {blog.author.avatar?.url ? (
                <img src={blog.author.avatar.url} alt="" className="w-full h-full object-cover" />
              ) : (
                blog.author.name[0]
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-ink group-hover:text-signal transition-colors">{blog.author.name}</p>
              <p className="text-xs font-mono text-ink-300">
                {formatDate(blog.publishedAt || blog.createdAt)} · {blog.readingTimeMinutes} min read
              </p>
            </div>
          </Link>

          {isOwnerOrAdmin && (
            <div className="flex gap-2">
              <Link to={`/dashboard/write/${blog._id}`} className="btn-secondary py-1.5 px-3 text-xs">
                <FiEdit2 size={13} /> Edit
              </Link>
              <button onClick={handleDelete} className="btn-danger py-1.5 px-3 text-xs">
                <FiTrash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {blog.coverImage?.url && (
        <img src={blog.coverImage.url} alt={blog.title} className="w-full rounded-xl2 mb-10 object-cover max-h-[480px]" />
      )}

      <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: blog.content }} />

      {blog.tags?.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <Link key={tag._id} to={`/blogs?tag=${tag.slug}`} className="text-xs font-mono px-3 py-1.5 rounded-full bg-ink/[0.04] text-ink-500 hover:bg-signal-50 hover:text-signal transition-colors">
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center gap-3 py-5 border-y border-ink/10">
        <button onClick={handleLike} className={`btn-secondary ${liked ? '!border-rose !text-rose bg-rose/5' : ''}`}>
          <FiHeart className={liked ? 'fill-rose' : ''} size={16} /> {formatCount(likesCount)}
        </button>
        <a href="#comments" className="btn-secondary">
          <FiMessageCircle size={16} /> {formatCount(blog.commentsCount)}
        </a>
        <button onClick={handleBookmark} className={`btn-secondary ${bookmarked ? '!border-stamp !text-stamp-dark bg-stamp/5' : ''}`}>
          <FiBookmark className={bookmarked ? 'fill-stamp' : ''} size={16} />
        </button>
        <button onClick={handleShare} className="btn-secondary">
          <FiShare2 size={16} />
        </button>
        <span className="ml-auto flex items-center gap-1.5 text-xs font-mono text-ink-300">
          <FiEye size={13} /> {formatCount(blog.views)} views
        </span>
      </div>

      <CommentSection blogId={blog._id} initialCount={blog.commentsCount} />

      {related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-ink/10">
          <h2 className="font-display text-2xl font-semibold text-ink mb-6">More like this</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {related.map((r) => <BlogCard key={r._id} blog={r} />)}
          </div>
        </div>
      )}
    </article>
  );
};

export default SingleBlogPage;
