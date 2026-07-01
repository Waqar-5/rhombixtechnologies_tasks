import { NavLink } from 'react-router-dom';
import { Home, Bell, Users, UserCircle, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { cx } from '../utils/helpers';

const MobileNav = () => {
  const { user } = useAuth();
  const { unreadCount } = useSocketContext();

  const items = [
    { to: '/', icon: Home, end: true },
    { to: '/friends', icon: Users },
    { to: '/notifications', icon: Bell, badge: true },
    { to: '/saved', icon: Bookmark },
    { to: user ? `/profile/${user.username}` : '/login', icon: UserCircle },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-ink-soft)] border-t border-[var(--color-border)] flex items-center justify-around py-2">
      {items.map(({ to, icon: Icon, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cx(
              'relative p-3 rounded-full transition-colors',
              isActive ? 'text-[var(--color-coral)]' : 'text-[var(--color-text-muted)]'
            )
          }
        >
          <Icon size={22} />
          {badge && unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-coral)]" />
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
