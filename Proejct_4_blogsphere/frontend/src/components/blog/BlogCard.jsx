import { Link } from 'react-router-dom';
import { FiClock, FiHeart, FiMessageCircle } from 'react-icons/fi';
import { formatDate, formatCount, stripHtml, truncate } from '../../utils/formatters';

/**
 * variant="featured" renders a larger asymmetric hero-style card (used on
 * the landing page); variant="default" is the standard grid/list card
 * used everywhere else (blog listing, author profile, related posts).
 */
const BlogCard = ({ blog, variant = 'default' }) => {
  if (!blog) return null;

  const excerpt = blog.excerpt || truncate(stripHtml(blog.content), 140);

  if (variant === 'featured') {
    return (
      <Link to={`/blogs/${blog.slug}`} className="group block relative rounded-xl2 overflow-hidden card">
        <div className="aspect-[16/9] overflow-hidden bg-signal-50">
          {blog.coverImage?.url ? (
            <img
              src={blog.coverImage.url}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display text-4xl text-signal-300">
              {blog.title[0]}
            </div>
          )}
          {blog.isFeatured && (
            <span className="stamp-badge absolute top-4 right-4 font-display text-xs font-semibold">★</span>
          )}
        </div>
        <div className="p-6">
          {blog.category?.name && (
            <span className="eyebrow">{blog.category.name}</span>
          )}
          <h3 className="mt-2 font-display text-2xl font-semibold text-ink leading-snug group-hover:text-signal transition-colors">
            {blog.title}
          </h3>
          <p className="mt-2 text-ink-400 font-body text-[15px] leading-relaxed">{excerpt}</p>
          <div className="mt-4 flex items-center gap-3 text-xs font-mono text-ink-300">
            <span>{blog.author?.name}</span>
            <span>·</span>
            <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><FiClock size={12} /> {blog.readingTimeMinutes} min</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/blogs/${blog.slug}`} className="group block card overflow-hidden">
      <div className="aspect-[16/10] overflow-hidden bg-signal-50 relative">
        {blog.coverImage?.url ? (
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display text-3xl text-signal-300">
            {blog.title[0]}
          </div>
        )}
        {blog.isFeatured && <span className="stamp-badge absolute top-3 right-3 text-xs">★</span>}
      </div>
      <div className="p-5">
        {blog.category?.name && <span className="eyebrow">{blog.category.name}</span>}
        <h3 className="mt-1.5 font-display text-lg font-semibold text-ink leading-snug line-clamp-2 group-hover:text-signal transition-colors">
          {blog.title}
        </h3>
        <p className="mt-1.5 text-sm text-ink-400 line-clamp-2 font-body">{excerpt}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <div className="w-6 h-6 rounded-full bg-signal-50 overflow-hidden flex items-center justify-center text-[10px] font-display text-signal">
              {blog.author?.avatar?.url ? (
                <img src={blog.author.avatar.url} alt="" className="w-full h-full object-cover" />
              ) : (
                blog.author?.name?.[0]
              )}
            </div>
            <span className="font-mono">{blog.author?.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-300 font-mono">
            <span className="flex items-center gap-1"><FiHeart size={12} /> {formatCount(blog.likesCount)}</span>
            <span className="flex items-center gap-1"><FiMessageCircle size={12} /> {formatCount(blog.commentsCount)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const BlogCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="aspect-[16/10] skeleton rounded-none" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-5 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-6 w-full mt-4" />
    </div>
  </div>
);

export default BlogCard;
