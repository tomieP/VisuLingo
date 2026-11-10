import axios from 'axios';
import { syncServerOffset } from '../utils/authoritativeTime';

const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Nếu đang mở trên Vercel, dùng origin /api để đi qua Vercel Edge proxy (Singapore), triệt tiêu lỗi CORS và tăng tốc độ
  if (typeof window !== 'undefined' && window.location.origin && window.location.origin.includes('vercel.app')) {
    return `${window.location.origin}/api`;
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

    // Tự động thử lại nếu gặp lỗi mạng hoặc Render đang khởi động lạnh
    const config = error.config;
    if (config && !config._retry) {
      config._retry = true;
      // Đổi qua lại giữa Vercel proxy và Render trực tiếp nếu một bên bị gián đoạn mạng
      if (config.baseURL && config.baseURL.includes('vercel.app')) {
        config.baseURL = 'https://visu-lingo.onrender.com/api';
      } else if (typeof window !== 'undefined' && window.location.origin && window.location.origin.includes('vercel.app')) {
        config.baseURL = `${window.location.origin}/api`;
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return api(config);
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
