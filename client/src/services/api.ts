import axios from 'axios';
import { syncServerOffset } from '../utils/authoritativeTime';

const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Tự động kết nối backend Render khi chạy trên Vercel / domain public / thiết bị điện thoại
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://visu-lingo.onrender.com/api';
    }
  }
  return '/api';
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
  (error) => {
    // Also calibrate if error response had a Date header
    const serverDateHeader = error.response?.headers?.date;
    if (serverDateHeader) {
      const serverMs = new Date(serverDateHeader).getTime();
      if (!isNaN(serverMs)) {
        syncServerOffset(serverMs);
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
