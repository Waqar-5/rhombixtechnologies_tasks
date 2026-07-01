import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, UserMinus, Clock3 } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import Avatar from '../components/Avatar';
import { friendService } from '../services/endpoints';
import { useSocketContext } from '../context/SocketContext';
import { cx } from '../utils/helpers';

const tabs = [
  { key: 'friends', label: 'All Friends' },
  { key: 'received', label: 'Requests' },
  { key: 'sent', label: 'Sent' },
];

const FriendsPage = () => {
  const { socket, onlineUserIds } = useSocketContext();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [friendsRes, receivedRes, sentRes] = await Promise.all([
        friendService.getMyFriends(),
        friendService.getReceived(),
        friendService.getSent(),
      ]);
      setFriends(friendsRes.data.friends);
      setReceived(receivedRes.data.requests);
      setSent(sentRes.data.requests);
    } catch (err) {
      toast.error('Could not load friends data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!socket) return;
    const handleReceived = (request) => setReceived((prev) => [request, ...prev]);
    const handleAdded = (friend) => setFriends((prev) => [friend, ...prev]);
    const handleRemoved = ({ userId }) => setFriends((prev) => prev.filter((f) => String(f._id) !== String(userId)));

    socket.on('friendRequest:received', handleReceived);
    socket.on('friend:added', handleAdded);
    socket.on('friend:removed', handleRemoved);

    return () => {
      socket.off('friendRequest:received', handleReceived);
      socket.off('friend:added', handleAdded);
      socket.off('friend:removed', handleRemoved);
    };
  }, [socket]);

  const handleAccept = async (requestId) => {
    try {
      await friendService.acceptRequest(requestId);
      const accepted = received.find((r) => r._id === requestId);
      setReceived((prev) => prev.filter((r) => r._id !== requestId));
      if (accepted) setFriends((prev) => [accepted.sender, ...prev]);
      toast.success('Friend request accepted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept request.');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await friendService.declineRequest(requestId);
      setReceived((prev) => prev.filter((r) => r._id !== requestId));
      toast.success('Friend request declined.');
    } catch (err) {
      toast.error('Could not decline request.');
    }
  };

  const handleCancel = async (requestId) => {
    try {
      await friendService.cancelRequest(requestId);
      setSent((prev) => prev.filter((r) => r._id !== requestId));
      toast.success('Request canceled.');
    } catch (err) {
      toast.error('Could not cancel request.');
    }
  };

  const handleUnfriend = async (userId) => {
    if (!confirm('Remove this friend?')) return;
    try {
      await friendService.unfriend(userId);
      setFriends((prev) => prev.filter((f) => String(f._id) !== String(userId)));
      toast.success('Friend removed.');
    } catch (err) {
      toast.error('Could not remove friend.');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-display text-2xl font-bold mb-4">Friends</h1>

        <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cx(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-colors relative',
                activeTab === tab.key
                  ? 'bg-[var(--color-surface-raised)] text-[var(--color-coral)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              )}
            >
              {tab.label}
              {tab.key === 'received' && received.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-coral)] text-white text-[10px] font-bold">
                  {received.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-16 rounded-xl" />
            <div className="skeleton h-16 rounded-xl" />
          </div>
        ) : (
          <div className="space-y-2">
            {activeTab === 'friends' &&
              (friends.length === 0 ? (
                <EmptyState text="No friends yet. Send some requests to get started." />
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3"
                  >
                    <Link to={`/profile/${friend.username}`}>
                      <Avatar src={friend.avatar} name={friend.name} online={onlineUserIds.has(String(friend._id))} />
                    </Link>
                    <Link to={`/profile/${friend.username}`} className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{friend.name}</p>
                      <p className="text-sm text-[var(--color-text-muted)] truncate">@{friend.username}</p>
                    </Link>
                    <button
                      onClick={() => handleUnfriend(friend._id)}
                      className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-[var(--color-surface-raised)] transition-colors"
                      title="Unfriend"
                    >
                      <UserMinus size={18} />
                    </button>
                  </div>
                ))
              ))}

            {activeTab === 'received' &&
              (received.length === 0 ? (
                <EmptyState text="No pending friend requests." />
              ) : (
                received.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3"
                  >
                    <Avatar src={req.sender.avatar} name={req.sender.name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{req.sender.name}</p>
                      <p className="text-sm text-[var(--color-text-muted)] truncate">@{req.sender.username}</p>
                    </div>
                    <button
                      onClick={() => handleAccept(req._id)}
                      className="p-2 rounded-lg bg-[var(--color-sage)] text-[var(--color-ink)] hover:opacity-90 transition-opacity"
                      title="Accept"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleDecline(req._id)}
                      className="p-2 rounded-lg bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                      title="Decline"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              ))}

            {activeTab === 'sent' &&
              (sent.length === 0 ? (
                <EmptyState text="You haven't sent any friend requests." />
              ) : (
                sent.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3"
                  >
                    <Avatar src={req.recipient.avatar} name={req.recipient.name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{req.recipient.name}</p>
                      <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-1">
                        <Clock3 size={12} /> Pending
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancel(req._id)}
                      className="px-3 py-1.5 rounded-lg text-sm bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ))
              ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const EmptyState = ({ text }) => (
  <div className="text-center py-12 text-[var(--color-text-muted)] text-sm">{text}</div>
);

export default FriendsPage;
