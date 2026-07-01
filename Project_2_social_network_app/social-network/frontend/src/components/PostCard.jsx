import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Globe,
  Users,
  Lock,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import CommentSection from './CommentSection';
import { postService } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { timeAgo, cx } from '../utils/helpers';

const visibilityIcon = {
  public: Globe,
  friends: Users,
  private: Lock,
};

const PostCard = ({ post, onDeleted }) => {
  const { user } = useAuth();
  const { socket } = useSocketContext();
  const [likes, setLikes] = useState(post.likes || []);
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
  const [shares, setShares] = useState(post.shares || 0);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const isLiked = likes.some((id) => String(id?._id || id) === String(user?._id));
  const VisibilityIcon = visibilityIcon[post.visibility] || Globe;

  // Listen for real-time like/comment updates on this specific post
  useEffect(() => {
    if (!socket) return;

    const handleLiked = (data) => {
      if (String(data.postId) === String(post._id)) {
        setLikes(data.likes);
      }
    };
    const handleNewComment = (data) => {
      if (String(data.postId) === String(post._id)) {
        setCommentCount((prev) => prev + 1);
      }
    };
    const handleDeletedComment = (data) => {
      if (String(data.postId) === String(post._id)) {
        setCommentCount((prev) => Math.max(0, prev - 1));
      }
    };
    const handleShared = (data) => {
      if (String(data.postId) === String(post._id)) {
        setShares(data.shares);
      }
    };

    socket.on('post:liked', handleLiked);
    socket.on('comment:new', handleNewComment);
    socket.on('comment:deleted', handleDeletedComment);
    socket.on('post:shared', handleShared);

    return () => {
      socket.off('post:liked', handleLiked);
      socket.off('comment:new', handleNewComment);
      socket.off('comment:deleted', handleDeletedComment);
      socket.off('post:shared', handleShared);
    };
  }, [socket, post._id]);

  const handleLike = useCallback(async () => {
    try {
      const { data } = await postService.toggleLike(post._id);
      setLikes(data.likes);
    } catch (err) {
      toast.error('Could not update like.');
    }
  }, [post._id]);

  const handleShare = useCallback(async () => {
    try {
      const { data } = await postService.share(post._id);
      setShares(data.shares);
      toast.success('Post shared to your network.');
    } catch (err) {
      toast.error('Could not share post.');
    }
  }, [post._id]);

  const handleSave = useCallback(async () => {
    try {
      const { data } = await postService.toggleSave(post._id);
      setSaved(data.saved);
      toast.success(data.saved ? 'Saved.' : 'Removed from saved.');
    } catch (err) {
      toast.error('Could not update saved posts.');
    }
  }, [post._id]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await postService.delete(post._id);
      toast.success('Post deleted.');
      onDeleted?.(post._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete post.');
    }
  }, [post._id, onDeleted]);

  const isAuthor = String(post.author?._id) === String(user?._id);

  return (
    <article className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5">
      <header className="flex items-start gap-3">
        <Link to={`/profile/${post.author?.username}`}>
          <Avatar src={post.author?.avatar} name={post.author?.name} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${post.author?.username}`} className="font-semibold hover:underline">
            {post.author?.name}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <span>{timeAgo(post.createdAt)} ago</span>
            {post.isEdited && <span>· edited</span>}
            <span>·</span>
            <VisibilityIcon size={12} />
          </div>
        </div>

        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-10 w-40 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-red-400 hover:bg-[var(--color-surface)] transition-colors"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {post.feeling && (
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          feeling <span className="text-[var(--color-gold)] font-medium">{post.feeling}</span>
        </p>
      )}

      {post.text && <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-wrap">{post.text}</p>}

      {post.media?.length > 0 && (
        <div
          className={cx(
            'mt-3 grid gap-1.5 rounded-xl overflow-hidden',
            post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          )}
        >
          {post.media.map((m, i) =>
            m.type === 'video' ? (
              <video key={i} src={m.url} controls className="w-full max-h-[480px] object-cover bg-black" />
            ) : (
              <img key={i} src={m.url} alt="" className="w-full max-h-[480px] object-cover" loading="lazy" />
            )
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
        <span>{likes.length > 0 && `${likes.length} ${likes.length === 1 ? 'like' : 'likes'}`}</span>
        <div className="flex items-center gap-3">
          {commentCount > 0 && <span>{commentCount} comments</span>}
          {shares > 0 && <span>{shares} shares</span>}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-[var(--color-border)] grid grid-cols-4 gap-1">
        <button
          onClick={handleLike}
          className={cx(
            'flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-surface-raised)]',
            isLiked ? 'text-[var(--color-coral)]' : 'text-[var(--color-text-muted)]'
          )}
        >
          <Heart size={18} fill={isLiked ? 'var(--color-coral)' : 'none'} />
          <span className="hidden sm:inline">Like</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] transition-colors"
        >
          <MessageCircle size={18} />
          <span className="hidden sm:inline">Comment</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] transition-colors"
        >
          <Share2 size={18} />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button
          onClick={handleSave}
          className={cx(
            'flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-surface-raised)]',
            saved ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-muted)]'
          )}
        >
          <Bookmark size={18} fill={saved ? 'var(--color-gold)' : 'none'} />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {showComments && <CommentSection postId={post._id} postAuthorId={post.author?._id} />}
    </article>
  );
};

export default PostCard;
