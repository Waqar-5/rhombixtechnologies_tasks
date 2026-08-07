import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { notificationService } from '../../services/resourceServices';
import EmptyState from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/Spinner';
import { formatRelativeTime, getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await notificationService.getNotifications({ limit: 50 });
      setNotifications(data.data.notifications);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={handleMarkAllRead} className="text-sm text-signal font-medium hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={FiBell} title="No notifications yet" description="Activity on your posts and comments will show up here." />
      ) : (
        <div className="mt-6 card divide-y divide-ink/[0.06]">
          {notifications.map((n) => (
            <div key={n._id} className={`flex items-start gap-3 px-5 py-4 ${!n.isRead ? 'bg-signal-50/40' : ''}`}>
              <div className="w-2 h-2 rounded-full bg-signal mt-2 shrink-0" style={{ visibility: n.isRead ? 'hidden' : 'visible' }} />
              <div className="flex-1 min-w-0">
                <Link to={n.link || '#'} onClick={() => !n.isRead && handleMarkRead(n._id)} className="text-sm text-ink hover:text-signal transition-colors">
                  {n.message}
                </Link>
                <p className="text-xs text-ink-300 font-mono mt-1">{formatRelativeTime(n.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.isRead && (
                  <button onClick={() => handleMarkRead(n._id)} className="p-1.5 text-ink-300 hover:text-signal transition-colors">
                    <FiCheck size={15} />
                  </button>
                )}
                <button onClick={() => handleDelete(n._id)} className="p-1.5 text-ink-300 hover:text-rose transition-colors">
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
