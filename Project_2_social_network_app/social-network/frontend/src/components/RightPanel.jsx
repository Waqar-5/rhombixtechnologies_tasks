import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { friendService, userService } from '../services/endpoints';
import { useSocketContext } from '../context/SocketContext';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

const RightPanel = () => {
  const { onlineUserIds } = useSocketContext();
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [requestedIds, setRequestedIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const [friendsRes, suggestionsRes] = await Promise.all([
          friendService.getMyFriends(),
          userService.getSuggestions(),
        ]);
        setFriends(friendsRes.data.friends);
        setSuggestions(suggestionsRes.data.users);
      } catch (err) {
        // Silent fail - this panel is supplementary, not critical path
      }
    };
    load();
  }, []);

  const handleAddFriend = async (userId) => {
    try {
      await friendService.sendRequest(userId);
      setRequestedIds((prev) => new Set(prev).add(userId));
      toast.success('Friend request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send request.');
    }
  };

  const onlineFriends = friends.filter((f) => onlineUserIds.has(String(f._id)));

  return (
    <aside className="hidden lg:flex lg:flex-col w-72 h-screen sticky top-0 px-4 py-6 gap-6 overflow-y-auto">
      <section>
        <h3 className="font-display font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wide mb-3 px-2">
          Online Now {onlineFriends.length > 0 && `(${onlineFriends.length})`}
        </h3>
        {onlineFriends.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] px-2">No friends online right now.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {onlineFriends.map((friend) => (
              <li key={friend._id}>
                <Link
                  to={`/profile/${friend.username}`}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[var(--color-surface)] transition-colors"
                >
                  <Avatar src={friend.avatar} name={friend.name} size="sm" online />
                  <span className="text-sm font-medium truncate">{friend.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-display font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wide mb-3 px-2">
          People You May Know
        </h3>
        {suggestions.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] px-2">No suggestions right now.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {suggestions.map((person) => (
              <li
                key={person._id}
                className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[var(--color-surface)] transition-colors"
              >
                <Link to={`/profile/${person.username}`}>
                  <Avatar src={person.avatar} name={person.name} size="sm" />
                </Link>
                <Link to={`/profile/${person.username}`} className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{person.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">@{person.username}</p>
                </Link>
                <button
                  onClick={() => handleAddFriend(person._id)}
                  disabled={requestedIds.has(person._id)}
                  title="Add friend"
                  className="p-1.5 rounded-full text-[var(--color-coral)] hover:bg-[var(--color-surface-raised)] disabled:text-[var(--color-text-muted)] disabled:cursor-default transition-colors"
                >
                  <UserPlus size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
};

export default RightPanel;
