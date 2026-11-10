import axios from 'axios';
import { syncServerOffset } from '../utils/authoritativeTime';

const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Mặc định kết nối trực tiếp backend đám mây Render (PostgreSQL Neon) để đồng bộ mọi tài khoản & snaps
  return 'https://visu-lingo.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('visulingo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: calibrate authoritative server time and handle 401 gracefully
api.interceptors.response.use(
  (response) => {
    // Calibrate server time offset from server's Date response header
    const serverDateHeader = response.headers?.date;
    if (serverDateHeader) {
      const serverMs = new Date(serverDateHeader).getTime();
      if (!isNaN(serverMs)) {
        syncServerOffset(serverMs);
      }
    }
    return response;
  },
  async (error) => {
    // Also calibrate if error response had a Date header
    const serverDateHeader = error.response?.headers?.date;
    if (serverDateHeader) {
      const serverMs = new Date(serverDateHeader).getTime();
      if (!isNaN(serverMs)) {
        syncServerOffset(serverMs);
      }
    }

    // Tự động thử lại 1 lần nếu gặp lỗi mạng tạm thời hoặc Render đang khởi động lạnh (cold start)
    const config = error.config;
    if (config && !config._retry) {
      const isTransientError =
        error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNABORTED' ||
        (error.response && [502, 503, 504].includes(error.response.status));

      if (isTransientError) {
        config._retry = true;
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return api(config);
      }
    }

    // Only redirect if explicit session expiration and not in login/register page
    if (error.response?.status === 401) {
      const isAuthRoute =
        typeof window !== 'undefined' &&
        (window.location.pathname === '/login' || window.location.pathname === '/register');

      // If user has a token, check if it was truly unauthorized before clearing
      const token = localStorage.getItem('visulingo_token');
      if (token && !isAuthRoute) {
        // Do not aggressively wipe out the session if client has local auth
        console.warn('API returned 401 Unauthorized for request:', error.config?.url);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
