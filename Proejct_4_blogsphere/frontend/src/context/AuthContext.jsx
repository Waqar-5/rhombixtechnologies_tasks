import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { setAccessToken } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true until initial session check resolves

  // On first load, try to silently refresh the session using the httpOnly
  // refresh cookie. If it succeeds, fetch the current user. If not, the
  // person is simply logged out — no error shown for that expected case.
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const { data } = await authService.refresh();
        setAccessToken(data.data.accessToken);
        const meRes = await authService.getMe();
        setUser(meRes.data.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    hydrateSession();

    const handleExpired = () => {
      setUser(null);
      toast.error('Your session has expired. Please log in again.');
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, []);

  const register = useCallback(async (payload) => {
    // Deliberately does NOT set accessToken/user here — the backend no
    // longer issues a session on registration, so the person has to log
    // in explicitly (typically after verifying their email first).
    const { data } = await authService.register(payload);
    return data;
  }, []);

  const login = useCallback(async (payload) => {
    const { data } = await authService.login(payload);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const updateUserLocal = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isLoading,
    register,
    login,
    logout,
    updateUserLocal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
