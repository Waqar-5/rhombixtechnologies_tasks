import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  Users,
  PlusCircle,
  BarChart3,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import VerifyEmailBanner from '@/components/common/VerifyEmailBanner';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const seekerLinks = [
  { label: 'Overview', to: '/seeker', icon: LayoutDashboard, end: true },
  { label: 'Applications', to: '/seeker/applications', icon: FileText },
  { label: 'Saved jobs', to: '/seeker/saved', icon: Bookmark },
  { label: 'Notifications', to: '/seeker/notifications', icon: Bell },
  { label: 'Profile', to: '/seeker/profile', icon: User }
];

const recruiterLinks = [
  { label: 'Overview', to: '/recruiter', icon: LayoutDashboard, end: true },
  { label: 'Jobs', to: '/recruiter/jobs', icon: Briefcase },
  { label: 'Post a job', to: '/recruiter/jobs/new', icon: PlusCircle },
  { label: 'Applicants', to: '/recruiter/applicants', icon: Users },
  { label: 'Analytics', to: '/recruiter/analytics', icon: BarChart3 },
  { label: 'Company', to: '/recruiter/company', icon: Building2 },
  { label: 'Notifications', to: '/recruiter/notifications', icon: Bell },
  { label: 'Profile', to: '/recruiter/profile', icon: Settings }
];

export default function DashboardLayout({ role }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const links = role === 'recruiter' ? recruiterLinks : seekerLinks;

  const handleLogout = async () => {
    await logout();
    toast.success("You've been logged out");
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Briefcase className="h-4.5 w-4.5 text-white" size={18} />
        </span>
        <span className="font-display text-lg font-bold">Nexus Jobs</span>
      </Link>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`
            }
          >
            <link.icon className="h-4 w-4 shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
        <div className="flex items-center gap-3 px-3 pt-3">
          <Avatar src={user?.avatar?.url} name={user?.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-border glass sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 w-64 glass-strong lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center justify-between px-4 h-16 border-b border-border glass sticky top-0 z-30">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Briefcase className="h-4 w-4 text-white" />
            </span>
            <span className="font-display font-bold">Nexus Jobs</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <VerifyEmailBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
