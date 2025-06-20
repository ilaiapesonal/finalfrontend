import axios, { AxiosError } from 'axios'; // Import AxiosError
import useAuthStore from '../store/authStore';
import refreshToken from './tokenrefresh';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/',
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Type for items in the failed queue
type FailedRequest = {
  resolve: (token: string | null) => void;
  reject: (error: Error | null) => void;
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = []; // Use the defined type

const processQueue = (error: Error | null, token: string | null = null) => { // Update error type
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error); // error is now Error | null
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError | unknown) => { // Updated error type
    if (axios.isAxiosError(error)) { // Type guard for AxiosError
      const originalRequest = error.config as any; // error.config can be undefined, handle appropriately or assert if sure

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise<string | null>(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = 'Bearer ' + token;
              }
              return axios(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshToken();
          if (api.defaults.headers.common) {
            api.defaults.headers.common.Authorization = 'Bearer ' + newToken;
          }
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = 'Bearer ' + newToken;
          }
          processQueue(null, newToken);
          return api(originalRequest);
        } catch (err) {
          // err from refreshToken could be AxiosError or other Error type
          processQueue(err instanceof Error ? err : new Error(String(err)), null);
          useAuthStore.getState().clearToken();
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    } // End of isAxiosError check

    // If not an AxiosError or not a 401 error to be handled by refresh logic, reject it
    return Promise.reject(error);
  }
);

export default api;
