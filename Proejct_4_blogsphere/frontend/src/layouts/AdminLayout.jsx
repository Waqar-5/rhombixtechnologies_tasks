import { NavLink, Outlet } from 'react-router-dom';
import { FiGrid, FiUsers, FiFileText, FiMessageSquare, FiTag, FiFolder } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/blogs', label: 'Blogs', icon: FiFileText },
  { to: '/admin/comments', label: 'Comments', icon: FiMessageSquare },
  { to: '/admin/categories', label: 'Categories', icon: FiFolder },
  { to: '/admin/tags', label: 'Tags', icon: FiTag },
];

const AdminLayout = () => (
  <div className="min-h-screen flex flex-col bg-paper">
    <Navbar />
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
      <aside className="md:w-56 shrink-0">
        <p className="eyebrow mb-3 px-1">Admin panel</p>
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-ink text-paper-light' : 'text-ink-500 hover:bg-ink/[0.05] hover:text-ink'
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

export default AdminLayout;
