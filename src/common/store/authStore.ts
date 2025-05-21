import { create } from 'zustand';
import axios from '../utils/axiosetup';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  username: string | null;
  usertype: string | null;
  isPasswordResetRequired: boolean;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setUsername: (username: string | null) => void;
  setUsertype: (usertype: string | null) => void;
  setIsPasswordResetRequired: (value: boolean) => void;
  clearToken: () => void;
  isAuthenticated: () => boolean;
  logout: () => Promise<void>;
}

const getStoredItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const useAuthStore = create<AuthState>((set, get) => ({
  token: getStoredItem('token'),
  refreshToken: getStoredItem('refreshToken'),
  username: getStoredItem('username'),
  usertype: getStoredItem('usertype'),
  isPasswordResetRequired: false,
  setToken: (token: string | null) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
    set({ token });
  },
  setRefreshToken: (refreshToken: string | null) => {
    if (typeof window !== 'undefined') {
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        localStorage.removeItem('refreshToken');
      }
    }
    set({ refreshToken });
  },
  setUsername: (username: string | null) => {
    if (typeof window !== 'undefined') {
      if (username) {
        localStorage.setItem('username', username);
      } else {
        localStorage.removeItem('username');
      }
    }
    set({ username });
  },
  setUsertype: (usertype: string | null) => {
    if (typeof window !== 'undefined') {
      if (usertype) {
        localStorage.setItem('usertype', usertype);
      } else {
        localStorage.removeItem('usertype');
      }
    }
    set({ usertype });
  },
  setIsPasswordResetRequired: (value: boolean) => {
    set({ isPasswordResetRequired: value });
  },
  clearToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('usertype');
    }
    set({ token: null, refreshToken: null, username: null, usertype: null, isPasswordResetRequired: false });
  },
  isAuthenticated: () => {
    const token = get().token;
    return token !== null;
  },
  logout: async () => {
    const refreshToken = get().refreshToken;
    try {
      if (!refreshToken) {
        throw new Error('No refresh token available for logout');
      }
      await axios.post('/authentication/logout/', { refresh: refreshToken });
      get().clearToken();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
}));

export default useAuthStore;
