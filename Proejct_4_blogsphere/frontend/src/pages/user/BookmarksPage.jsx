import { useEffect, useState } from 'react';
import { FiBookmark } from 'react-icons/fi';
import { blogService } from '../../services/blogService';
import BlogCard, { BlogCardSkeleton } from '../../components/blog/BlogCard';
import EmptyState from '../../components/ui/EmptyState';
import { getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

const BookmarksPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    blogService.getMyBookmarks({ limit: 50 })
      .then((res) => setBlogs(res.data.data.blogs))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Bookmarks</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <BlogCardSkeleton key={i} />)}
        </div>
      ) : blogs.length === 0 ? (
        <EmptyState icon={FiBookmark} title="No bookmarks yet" description="Save posts you want to revisit later." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
