import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { notificationsApi } from '@/api/notifications';
import { formatRelativeDate, cn } from '@/lib/utils';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    notificationsApi
      .getAll({ limit: 30 })
      .then((data) => setNotifications(data.notifications))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const markRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      // silent
    }
  };

  const remove = async (id) => {
    try {
      await notificationsApi.remove(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay up to date on your applications and account activity."
        actions={
          notifications.some((n) => !n.isRead) && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </Button>
          )
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="We'll let you know when something needs your attention." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={cn(
                'flex items-start gap-3 rounded-2xl border p-4 transition-colors',
                n.isRead ? 'border-border bg-card' : 'border-primary/30 bg-primary/5'
              )}
            >
              <div className={cn('mt-1 h-2 w-2 rounded-full shrink-0', n.isRead ? 'bg-transparent' : 'bg-primary')} />
              <Link to={n.link || '#'} onClick={() => markRead(n._id)} className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(n.createdAt)}</p>
              </Link>
              <button onClick={() => remove(n._id)} className="text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
