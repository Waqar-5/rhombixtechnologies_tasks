import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiMenu, FiX, FiBell, FiBookmark, FiEdit3, FiUser, FiLogOut, FiSettings, FiGrid,
} from 'react-icons/fi';
import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/blogs?search=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-paper-light/90 backdrop-blur-md border-b border-ink/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Logo />

          <nav className="hidden lg:flex items-center gap-7 font-sans text-sm font-medium text-ink-500">
            <Link to="/blogs" className="ink-link hover:text-ink">Blogs</Link>
            <Link to="/categories" className="ink-link hover:text-ink">Categories</Link>
            <Link to="/about" className="ink-link hover:text-ink">About</Link>
          </nav>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stories..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-ink/10 bg-paper focus:border-signal focus:bg-paper-light transition-colors"
            />
          </form>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard/write" className="btn-primary">
                  <FiEdit3 size={15} /> Write
                </Link>
                <Link to="/dashboard/notifications" className="spring-icon block p-2 rounded-full hover:bg-ink/[0.05] text-ink-500 hover:text-ink">
                  <FiBell size={19} />
                </Link>
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="spring-icon w-9 h-9 rounded-full overflow-hidden border border-ink/10 bg-signal-50 flex items-center justify-center"
                  >
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display text-signal text-sm">{user?.name?.[0]?.toUpperCase()}</span>
                    )}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-paper-light rounded-xl border border-ink/10 shadow-card-hover py-2 animate-fade-up">
                      <div className="px-4 py-2 border-b border-ink/[0.06]">
                        <p className="font-medium text-sm text-ink truncate">{user?.name}</p>
                        <p className="text-xs text-ink-400 truncate">{user?.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-ink-600 hover:bg-ink/[0.04]">
                        <FiGrid size={15} /> Dashboard
                      </Link>
                      <Link to="/dashboard/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-ink-600 hover:bg-ink/[0.04]">
                        <FiUser size={15} /> Profile
                      </Link>
                      <Link to="/dashboard/bookmarks" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-ink-600 hover:bg-ink/[0.04]">
                        <FiBookmark size={15} /> Bookmarks
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-ink-600 hover:bg-ink/[0.04]">
                          <FiSettings size={15} /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose hover:bg-rose/[0.06] text-left">
                        <FiLogOut size={15} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Log in</Link>
                <Link to="/register" className="btn-primary">Get started</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-ink" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-ink/[0.07] bg-paper-light px-4 py-4 space-y-4 animate-fade-up">
          <form onSubmit={handleSearch} className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stories..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-full border border-ink/10 bg-paper"
            />
          </form>
          <nav className="flex flex-col gap-1 font-medium text-ink-600 text-sm">
            <Link to="/blogs" onClick={() => setMenuOpen(false)} className="py-2">Blogs</Link>
            <Link to="/categories" onClick={() => setMenuOpen(false)} className="py-2">Categories</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="py-2">About</Link>
          </nav>
          {isAuthenticated ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-ink/[0.07]">
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="btn-secondary w-full">Dashboard</Link>
              <Link to="/dashboard/write" onClick={() => setMenuOpen(false)} className="btn-primary w-full">Write</Link>
              <button onClick={handleLogout} className="btn-ghost w-full text-rose">Logout</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-ink/[0.07]">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary w-full">Log in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary w-full">Get started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
