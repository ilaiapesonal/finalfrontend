import { create } from 'zustand';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  username: string | null;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setUsername: (username: string | null) => void;
  clearToken: () => void;
  isAuthenticated: () => boolean;
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
  clearToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
    }
    set({ token: null, refreshToken: null, username: null });
  },
  isAuthenticated: () => {
    const token = get().token;
    return token !== null;
  },
}));

export default useAuthStore;
