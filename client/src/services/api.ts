import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

// Response interceptor: handle 401 gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
