import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import PostCard from '../components/PostCard';
import { userService } from '../services/endpoints';

const SavedPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await userService.getSavedPosts();
        setPosts(data.posts);
      } catch (err) {
        toast.error('Could not load saved posts.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-display text-2xl font-bold mb-4">Saved Posts</h1>

        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-32 rounded-2xl" />
            <div className="skeleton h-32 rounded-2xl" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-muted)]">
            <p className="font-display text-lg mb-1">Nothing saved yet.</p>
            <p className="text-sm">Tap the bookmark icon on any post to save it for later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SavedPostsPage;
