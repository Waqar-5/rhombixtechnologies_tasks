import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import { postService } from '../services/endpoints';
import { useSocketContext } from '../context/SocketContext';

const FeedSkeleton = () => (
  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-3">
    <div className="flex items-center gap-3">
      <div className="skeleton w-11 h-11 rounded-full" />
      <div className="space-y-2 flex-1">
        <div className="skeleton h-3 w-32 rounded" />
        <div className="skeleton h-2.5 w-20 rounded" />
      </div>
    </div>
    <div className="skeleton h-3 w-full rounded" />
    <div className="skeleton h-3 w-2/3 rounded" />
  </div>
);

const FeedPage = () => {
  const { socket } = useSocketContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFeed = useCallback(async (pageNum = 1) => {
    try {
      const { data } = await postService.getFeed(pageNum);
      setPosts((prev) => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
      setHasMore(pageNum < data.totalPages);
    } catch (err) {
      toast.error('Could not load feed.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(1);
  }, [loadFeed]);

  // Listen for brand-new posts broadcast in real-time
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (post) => {
      setPosts((prev) => {
        if (prev.some((p) => String(p._id) === String(post._id))) return prev;
        return [post, ...prev];
      });
    };

    const handleDeletedPost = ({ postId }) => {
      setPosts((prev) => prev.filter((p) => String(p._id) !== String(postId)));
    };

    const handleUpdatedPost = (updated) => {
      setPosts((prev) => prev.map((p) => (String(p._id) === String(updated._id) ? updated : p)));
    };

    socket.on('post:new', handleNewPost);
    socket.on('post:deleted', handleDeletedPost);
    socket.on('post:updated', handleUpdatedPost);

    return () => {
      socket.off('post:new', handleNewPost);
      socket.off('post:deleted', handleDeletedPost);
      socket.off('post:updated', handleUpdatedPost);
    };
  }, [socket]);

  const handlePostCreated = (post) => {
    setPosts((prev) => [post, ...prev]);
  };

  const handleDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => String(p._id) !== String(postId)));
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    await loadFeed(next);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <PostComposer onPostCreated={handlePostCreated} />

        {loading ? (
          <div className="space-y-4">
            <FeedSkeleton />
            <FeedSkeleton />
            <FeedSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-muted)]">
            <p className="font-display text-lg mb-1">Your feed is quiet.</p>
            <p className="text-sm">Add some friends or write the first post to get things moving.</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onDeleted={handleDeleted} />
            ))}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading…' : 'Load more posts'}
              </button>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default FeedPage;
