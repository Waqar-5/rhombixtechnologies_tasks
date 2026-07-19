import { create } from 'zustand';
import { authService } from '../lib/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('skyline_token') || null,
  status: 'idle', // idle | loading | error
  error: null,

  async bootstrap() {
    const token = get().token;
    if (!token) return;
    try {
      const { user } = await authService.me();
      set({ user });
    } catch {
      localStorage.removeItem('skyline_token');
      set({ user: null, token: null });
    }
  },

  async login(email, password) {
    set({ status: 'loading', error: null });
    try {
      const { token, user } = await authService.login({ email, password });
      localStorage.setItem('skyline_token', token);
      set({ token, user, status: 'idle' });
      return true;
    } catch (err) {
      set({ status: 'error', error: err.response?.data?.message || 'Something went wrong.' });
      return false;
    }
  },

  async register(name, email, password) {
    set({ status: 'loading', error: null });
    try {
      const { token, user } = await authService.register({ name, email, password });
      localStorage.setItem('skyline_token', token);
      set({ token, user, status: 'idle' });
      return true;
    } catch (err) {
      set({ status: 'error', error: err.response?.data?.message || 'Something went wrong.' });
      return false;
    }
  },

  logout() {
    localStorage.removeItem('skyline_token');
    set({ user: null, token: null });
  }
}));
