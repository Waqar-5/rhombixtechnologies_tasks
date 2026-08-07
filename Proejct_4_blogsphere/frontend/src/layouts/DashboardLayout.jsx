import { NavLink, Outlet } from 'react-router-dom';
import {
  FiGrid, FiFileText, FiEdit3, FiBookmark, FiBell, FiUser, FiSettings,
} from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: FiGrid, end: true },
  { to: '/dashboard/my-blogs', label: 'My blogs', icon: FiFileText },
  { to: '/dashboard/write', label: 'Write', icon: FiEdit3 },
  { to: '/dashboard/bookmarks', label: 'Bookmarks', icon: FiBookmark },
  { to: '/dashboard/notifications', label: 'Notifications', icon: FiBell },
  { to: '/dashboard/profile', label: 'Profile', icon: FiUser },
  { to: '/dashboard/settings', label: 'Settings', icon: FiSettings },
];

const DashboardLayout = () => (
  <div className="min-h-screen flex flex-col bg-paper">
    <Navbar />
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
      <aside className="md:w-56 shrink-0">
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-signal text-paper-light' : 'text-ink-500 hover:bg-ink/[0.05] hover:text-ink'
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
