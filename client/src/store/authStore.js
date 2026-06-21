import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', data);
      // DON'T store token or set authenticated after register
      // User must verify email first, then login
      set({ isLoading: false });
      return { success: true, message: res.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', data);
      const { user, token } = res.data.data;
      
      localStorage.setItem('token', token);
      set({
        user,
        isAuthenticated: true,
        isAdmin: user.role === 'ADMIN',
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const needsVerification = error.response?.data?.needsVerification || false;
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed',
        needsVerification 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({
        user: res.data.data,
        isAuthenticated: true,
        isAdmin: res.data.data.role === 'ADMIN',
        isLoading: false
      });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
    }
  },
}));