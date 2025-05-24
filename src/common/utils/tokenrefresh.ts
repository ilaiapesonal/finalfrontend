import axios from 'axios';
import useAuthStore from '../store/authStore';

const refreshToken = async () => {
  const refresh = useAuthStore.getState().refreshToken;
  if (!refresh) {
    throw new Error('No refresh token available');
  }

  const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/';

  try {
    const response = await axios.post(`${baseURL}authentication/token/refresh/`, {
      refresh,
    });
    const newAccessToken = response.data.access;
    useAuthStore.getState().setToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    useAuthStore.getState().clearToken();
    throw error;
  }
};

export default refreshToken;
