import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import PostCard from '../components/PostCard';
import { postService } from '../services/endpoints';

const SinglePostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await postService.getById(postId);
        setPost(data.post);
      } catch (err) {
        toast.error('Could not load post. It may have been deleted.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId, navigate]);

  return (
    <AppLayout hideRightPanel>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {loading ? (
          <div className="skeleton h-48 rounded-2xl" />
        ) : post ? (
          <PostCard post={post} onDeleted={() => navigate('/')} />
        ) : null}
      </div>
    </AppLayout>
  );
};

export default SinglePostPage;
