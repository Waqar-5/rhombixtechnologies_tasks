import { createContext, useContext, useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { connectSocket } from '../services/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      socketRef.current = null;
      return;
    }

    const socket = connectSocket();
    socketRef.current = socket;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      const senderName = notification.sender?.name || 'Someone';
      toast(`${senderName} ${describeNotification(notification.type)}`, {
        icon: iconForType(notification.type),
      });
    };

    const handleOnline = ({ userId }) => {
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    };

    const handleOffline = ({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('presence:online', handleOnline);
    socket.on('presence:offline', handleOffline);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('presence:online', handleOnline);
      socket.off('presence:offline', handleOffline);
    };
  }, [user]);

  const markNotificationsSeen = () => setUnreadCount(0);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineUserIds,
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        markNotificationsSeen,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

const describeNotification = (type) => {
  switch (type) {
    case 'friend_request':
      return 'sent you a friend request';
    case 'friend_accept':
      return 'accepted your friend request';
    case 'like_post':
      return 'liked your post';
    case 'like_comment':
      return 'liked your comment';
    case 'comment_post':
      return 'commented on your post';
    case 'reply_comment':
      return 'replied to your comment';
    default:
      return 'interacted with you';
  }
};

const iconForType = (type) => {
  switch (type) {
    case 'friend_request':
    case 'friend_accept':
      return '👥';
    case 'like_post':
    case 'like_comment':
      return '❤️';
    case 'comment_post':
    case 'reply_comment':
      return '💬';
    default:
      return '🔔';
  }
};

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext must be used within a SocketProvider');
  return ctx;
};
