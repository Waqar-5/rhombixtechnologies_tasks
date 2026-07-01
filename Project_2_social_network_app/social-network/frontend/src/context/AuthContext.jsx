import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/endpoints';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check if a valid session cookie already exists
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await authService.getMe();
        setUser(data.user);
        connectSocket();
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (identifier, password) => {
    const { data } = await authService.login({ identifier, password });
    setUser(data.user);
    connectSocket();
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authService.register(formData);
    setUser(data.user);
    connectSocket();
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      disconnectSocket();
      setUser(null);
    }
  }, []);

  const updateUserLocal = useCallback((partialUser) => {
    setUser((prev) => ({ ...prev, ...partialUser }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, updateUserLocal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
