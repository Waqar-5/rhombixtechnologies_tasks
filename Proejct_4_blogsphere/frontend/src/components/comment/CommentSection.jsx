import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import { useAuth } from '../../context/AuthContext';
import CommentItem from './CommentItem';
import Spinner from '../ui/Spinner';
import { getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CommentSection = ({ blogId, initialCount = 0 }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await blogService.getComments(blogId, { limit: 50 });
        setComments(data.data.comments);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const { data } = await blogService.addComment(blogId, { content: newComment.trim() });
      setComments((prev) => [{ ...data.data.comment, repliesCount: 0 }, ...prev]);
      setNewComment('');
      toast.success('Comment posted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPosting(false);
    }
  };

  return (
    <section id="comments" className="mt-16 pt-10 border-t border-ink/10">
      <h2 className="font-display text-2xl font-semibold text-ink mb-6">
        Comments <span className="text-ink-300 font-mono text-lg">({comments.length || initialCount})</span>
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-signal-50 flex items-center justify-center text-sm font-display text-signal overflow-hidden shrink-0">
            {user?.avatar?.url ? <img src={user.avatar.url} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="input"
            />
            <button type="submit" disabled={posting || !newComment.trim()} className="btn-primary mt-2">
              {posting ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-8 text-sm text-ink-400">
          <Link to="/login" className="text-signal font-medium hover:underline">Log in</Link> to join the discussion.
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-400 py-6">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              blogId={blogId}
              onDeleted={(id) => setComments((prev) => prev.filter((c) => c._id !== id))}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentSection;
