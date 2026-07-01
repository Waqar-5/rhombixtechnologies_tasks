import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, Reply, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import { commentService } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { timeAgo, cx } from '../utils/helpers';

const CommentItem = ({ comment, onReply, onDelete, currentUserId, postAuthorId }) => {
  const isLiked = comment.likes?.some((id) => String(id?._id || id) === String(currentUserId));
  const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);
  const [liked, setLiked] = useState(isLiked);

  const handleLike = async () => {
    try {
      const { data } = await commentService.toggleLike(comment._id);
      setLikeCount(data.likes.length);
      setLiked(data.liked);
    } catch (err) {
      toast.error('Could not like comment.');
    }
  };

  const canDelete =
    String(comment.author?._id) === String(currentUserId) || String(postAuthorId) === String(currentUserId);

  return (
    <div className="flex gap-2.5">
      <Link to={`/profile/${comment.author?.username}`}>
        <Avatar src={comment.author?.avatar} name={comment.author?.name} size="xs" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-[var(--color-surface-raised)] rounded-2xl px-3.5 py-2 inline-block max-w-full">
          <Link to={`/profile/${comment.author?.username}`} className="text-sm font-semibold hover:underline">
            {comment.author?.name}
          </Link>
          <p className="text-sm whitespace-pre-wrap break-words">{comment.text}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1 text-xs text-[var(--color-text-muted)]">
          <span>{timeAgo(comment.createdAt)} ago</span>
          <button
            onClick={handleLike}
            className={cx('font-medium hover:underline', liked && 'text-[var(--color-coral)]')}
          >
            Like {likeCount > 0 && `(${likeCount})`}
          </button>
          <button onClick={() => onReply(comment)} className="font-medium hover:underline flex items-center gap-1">
            <Reply size={12} /> Reply
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(comment._id)}
              className="font-medium hover:underline text-red-400 flex items-center gap-1"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentSection = ({ postId, postAuthorId }) => {
  const { user } = useAuth();
  const { socket } = useSocketContext();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await commentService.getForPost(postId);
        setComments(data.comments);
      } catch (err) {
        toast.error('Could not load comments.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('post:join', postId);

    const handleNewComment = (data) => {
      if (String(data.postId) === String(postId)) {
        setComments((prev) => [...prev, data.comment]);
      }
    };
    const handleDeletedComment = (data) => {
      if (String(data.postId) === String(postId)) {
        setComments((prev) => prev.filter((c) => String(c._id) !== String(data.commentId)));
      }
    };
    const handleLikedComment = (data) => {
      setComments((prev) =>
        prev.map((c) => (String(c._id) === String(data.commentId) ? { ...c, likes: data.likes } : c))
      );
    };
    const handleTyping = (data) => {
      if (String(data.postId) === String(postId)) setTypingUser(data.userName);
    };
    const handleStopTyping = (data) => {
      if (String(data.postId) === String(postId)) setTypingUser(null);
    };

    socket.on('comment:new', handleNewComment);
    socket.on('comment:deleted', handleDeletedComment);
    socket.on('comment:liked', handleLikedComment);
    socket.on('comment:typing', handleTyping);
    socket.on('comment:stopTyping', handleStopTyping);

    return () => {
      socket.emit('post:leave', postId);
      socket.off('comment:new', handleNewComment);
      socket.off('comment:deleted', handleDeletedComment);
      socket.off('comment:liked', handleLikedComment);
      socket.off('comment:typing', handleTyping);
      socket.off('comment:stopTyping', handleStopTyping);
    };
  }, [socket, postId]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!socket) return;
    socket.emit('comment:typing', { postId, userName: user.name });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('comment:stopTyping', { postId });
    }, 1500);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!text.trim()) return;
      try {
        await commentService.add(postId, { text, parentComment: replyTo?._id || null });
        setText('');
        setReplyTo(null);
        socket?.emit('comment:stopTyping', { postId });
      } catch (err) {
        toast.error('Could not post comment.');
      }
    },
    [text, postId, replyTo, socket]
  );

  const handleDelete = useCallback(async (commentId) => {
    try {
      await commentService.delete(commentId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete comment.');
    }
  }, []);

  // Build a simple top-level + replies structure
  const topLevel = comments.filter((c) => !c.parentComment);
  const repliesFor = (id) => comments.filter((c) => String(c.parentComment) === String(id));

  return (
    <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-3">
      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-10 rounded-xl" />
          <div className="skeleton h-10 rounded-xl w-2/3" />
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {topLevel.map((comment) => (
            <div key={comment._id} className="space-y-2">
              <CommentItem
                comment={comment}
                onReply={setReplyTo}
                onDelete={handleDelete}
                currentUserId={user._id}
                postAuthorId={postAuthorId}
              />
              {repliesFor(comment._id).length > 0 && (
                <div className="pl-9 space-y-2">
                  {repliesFor(comment._id).map((reply) => (
                    <CommentItem
                      key={reply._id}
                      comment={reply}
                      onReply={setReplyTo}
                      onDelete={handleDelete}
                      currentUserId={user._id}
                      postAuthorId={postAuthorId}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {topLevel.length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-2">
              No comments yet. Be the first to say something.
            </p>
          )}
        </div>
      )}

      {typingUser && typingUser !== user.name && (
        <p className="text-xs text-[var(--color-text-muted)] italic px-1">{typingUser} is typing…</p>
      )}

      {replyTo && (
        <div className="flex items-center justify-between text-xs px-1 text-[var(--color-text-muted)]">
          <span>
            Replying to <strong>{replyTo.author?.name}</strong>
          </span>
          <button onClick={() => setReplyTo(null)} className="hover:underline">
            Cancel
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Avatar src={user.avatar} name={user.name} size="xs" />
        <input
          value={text}
          onChange={handleTextChange}
          placeholder="Write a comment…"
          className="flex-1 bg-[var(--color-surface-raised)] rounded-full px-4 py-2 text-sm outline-none placeholder:text-[var(--color-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--color-coral)]"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2 rounded-full text-[var(--color-coral)] disabled:text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
