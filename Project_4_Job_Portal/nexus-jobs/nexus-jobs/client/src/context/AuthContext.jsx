import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('nexus_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { user: me } = await authApi.getMe();
      setUser(me);
    } catch (error) {
      localStorage.removeItem('nexus_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    localStorage.setItem('nexus_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    localStorage.setItem('nexus_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // ignore - clearing local state regardless
    }
    localStorage.removeItem('nexus_token');
    setUser(null);
  };

  const refreshUser = async () => {
    const { user: me } = await authApi.getMe();
    setUser(me);
    return me;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: Boolean(user),
        isRecruiter: user?.role === 'recruiter',
        isJobseeker: user?.role === 'jobseeker'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
