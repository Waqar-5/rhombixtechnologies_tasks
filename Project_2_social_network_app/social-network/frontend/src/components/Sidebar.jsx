import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Bell, Users, Bookmark, Settings, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import Avatar from './Avatar';
import { cx } from '../utils/helpers';

const navItems = [
  { to: '/', label: 'Feed', icon: Home, end: true },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: true },
  { to: '/saved', label: 'Saved', icon: Bookmark },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocketContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 h-screen sticky top-0 border-r border-[var(--color-border)] bg-[var(--color-ink-soft)] px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <span className="pulse-dot is-coral" />
        <span className="font-display text-2xl font-bold tracking-tight text-[var(--color-text)]">
          Pulse
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-surface-raised)] text-[var(--color-coral)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
              )
            }
          >
            <Icon size={20} strokeWidth={2} />
            <span>{label}</span>
            {badge && unreadCount > 0 && (
              <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--color-coral)] text-white text-[11px] font-semibold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}

        {user && (
          <NavLink
            to={`/profile/${user.username}`}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-surface-raised)] text-[var(--color-coral)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
              )
            }
          >
            <UserCircle size={20} strokeWidth={2} />
            <span>Profile</span>
          </NavLink>
        )}
      </nav>

      {user && (
        <div className="mt-auto pt-4 border-t border-[var(--color-border)] flex items-center gap-3 px-2">
          <Avatar src={user.avatar} name={user.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">@{user.username}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-coral)] hover:bg-[var(--color-surface)] transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
