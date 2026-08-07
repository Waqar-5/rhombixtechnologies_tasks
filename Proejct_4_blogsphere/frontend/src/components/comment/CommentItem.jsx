import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiCornerDownRight, FiEdit2, FiTrash2, FiFlag } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { blogService } from '../../services/blogService';
import { formatRelativeTime, getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CommentItem = ({ comment, blogId, onReplyPosted, onDeleted, isReply = false }) => {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [busy, setBusy] = useState(false);

  const isOwner = user && String(user._id) === String(comment.author?._id);

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error('Log in to like comments');
    try {
      const { data } = await blogService.likeComment(comment._id);
      setLiked(data.data.liked);
      setLikesCount(data.data.likesCount);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const loadReplies = async () => {
    if (repliesLoaded) return;
    try {
      const { data } = await blogService.getReplies(comment._id);
      setReplies(data.data.replies);
      setRepliesLoaded(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setBusy(true);
    try {
      const { data } = await blogService.addComment(blogId, {
        content: replyText.trim(),
        parentComment: comment._id,
      });
      setReplies((prev) => [...prev, data.data.comment]);
      setRepliesLoaded(true);
      setReplyText('');
      setShowReplyBox(false);
      onReplyPosted?.(comment._id);
      toast.success('Reply posted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submitEdit = async () => {
    if (!editText.trim()) return;
    setBusy(true);
    try {
      await blogService.updateComment(comment._id, editText.trim());
      comment.content = editText.trim();
      comment.isEdited = true;
      setIsEditing(false);
      toast.success('Comment updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment? This cannot be undone.')) return;
    try {
      await blogService.deleteComment(comment._id);
      onDeleted?.(comment._id);
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReport = async () => {
    const reason = window.prompt('Why are you reporting this comment?');
    if (!reason) return;
    try {
      await blogService.reportComment(comment._id, reason);
      toast.success('Reported. Thanks for helping keep BlogSphere civil.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className={isReply ? 'ml-10 mt-4' : 'py-5 border-b border-ink/[0.06] last:border-0'}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-signal-50 flex items-center justify-center text-xs font-display text-signal overflow-hidden shrink-0">
          {comment.author?.avatar?.url ? (
            <img src={comment.author.avatar.url} alt="" className="w-full h-full object-cover" />
          ) : (
            comment.author?.name?.[0]
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-ink">{comment.author?.name}</span>
            <span className="text-ink-300 font-mono text-xs">{formatRelativeTime(comment.createdAt)}</span>
            {comment.isEdited && <span className="text-ink-300 text-xs">(edited)</span>}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="input text-sm"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={submitEdit} disabled={busy} className="btn-primary py-1.5 px-4 text-xs">Save</button>
                <button onClick={() => setIsEditing(false)} className="btn-ghost py-1.5 px-4 text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-ink-600 leading-relaxed">{comment.content}</p>
          )}

          <div className="mt-2 flex items-center gap-4 text-xs text-ink-400">
            <button onClick={handleLike} className={`flex items-center gap-1 hover:text-rose transition-colors ${liked ? 'text-rose' : ''}`}>
              <FiHeart size={13} className={liked ? 'fill-rose' : ''} /> {likesCount || ''}
            </button>
            {!isReply && (
              <button onClick={() => setShowReplyBox((v) => !v)} className="flex items-center gap-1 hover:text-signal transition-colors">
                <FiCornerDownRight size={13} /> Reply
              </button>
            )}
            {isOwner && (
              <>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 hover:text-signal transition-colors">
                  <FiEdit2 size={13} />
                </button>
                <button onClick={handleDelete} className="flex items-center gap-1 hover:text-rose transition-colors">
                  <FiTrash2 size={13} />
                </button>
              </>
            )}
            {!isOwner && isAuthenticated && (
              <button onClick={handleReport} className="flex items-center gap-1 hover:text-rose transition-colors">
                <FiFlag size={13} />
              </button>
            )}
          </div>

          {showReplyBox && (
            <form onSubmit={submitReply} className="mt-3 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="input text-sm py-2"
                autoFocus
              />
              <button type="submit" disabled={busy} className="btn-primary py-2 px-4 text-xs shrink-0">Post</button>
            </form>
          )}

          {!isReply && comment.repliesCount > 0 && !repliesLoaded && (
            <button onClick={loadReplies} className="mt-3 text-xs font-medium text-signal hover:underline">
              View {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {repliesLoaded && replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              blogId={blogId}
              isReply
              onDeleted={(id) => setReplies((prev) => prev.filter((r) => r._id !== id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
