import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, UserCheck, Trash2, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import Avatar from '../components/Avatar';
import { notificationService } from '../services/endpoints';
import { useSocketContext } from '../context/SocketContext';
import { timeAgo, cx } from '../utils/helpers';

const iconMap = {
  friend_request: UserPlus,
  friend_accept: UserCheck,
  like_post: Heart,
  like_comment: Heart,
  comment_post: MessageCircle,
  reply_comment: MessageCircle,
};

const linkFor = (n) => {
  if (n.type === 'friend_request' || n.type === 'friend_accept') return '/friends';
  if (n.post) return `/post/${n.post._id}`;
  return '#';
};

const NotificationsPage = () => {
  const { setNotifications: setGlobalNotifications, markNotificationsSeen } = useSocketContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await notificationService.getAll();
      setNotifications(data.notifications);
      setGlobalNotifications(data.notifications);
    } catch (err) {
      toast.error('Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, [setGlobalNotifications]);

  useEffect(() => {
    load();
    markNotificationsSeen();
  }, [load, markNotificationsSeen]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      // non-critical
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All caught up.');
    } catch (err) {
      toast.error('Could not mark all as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      toast.error('Could not delete notification.');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl font-bold">Notifications</h1>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-sm text-[var(--color-coral)] hover:underline"
            >
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-16 rounded-xl" />
            <div className="skeleton h-16 rounded-xl" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-muted)]">
            <p className="font-display text-lg mb-1">No notifications yet.</p>
            <p className="text-sm">Likes, comments, and friend requests will show up here.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {notifications.map((n) => {
              const Icon = iconMap[n.type] || Heart;
              return (
                <Link
                  key={n._id}
                  to={linkFor(n)}
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                  className={cx(
                    'flex items-center gap-3 p-3 rounded-xl border transition-colors group',
                    n.isRead
                      ? 'bg-[var(--color-surface)] border-[var(--color-border)]'
                      : 'bg-[var(--color-surface-raised)] border-[var(--color-coral)]/30'
                  )}
                >
                  <div className="relative">
                    <Avatar src={n.sender?.avatar} name={n.sender?.name} size="sm" />
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[var(--color-surface-raised)] text-[var(--color-coral)]">
                      <Icon size={11} fill={n.type.includes('like') ? 'var(--color-coral)' : 'none'} />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <strong>{n.sender?.name}</strong> {n.message?.replace(n.sender?.name, '').trim() || ''}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">{timeAgo(n.createdAt)} ago</p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-[var(--color-coral)] shrink-0" />}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(n._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
