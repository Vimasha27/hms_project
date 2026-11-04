import axios from 'axios';

// Resolve API base URL from Vite environment variables (supports VITE_API_BASE_URL, VITE_API_URL, or VITE_BACKEND_URL)
const rawApiUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  ''
).trim();

// Normalize API base URL: ensure it ends with '/api' unless it's the fallback relative path '/api'
export const API_BASE_URL = rawApiUrl
  ? rawApiUrl.endsWith('/api')
    ? rawApiUrl
    : `${rawApiUrl.replace(/\/+$/, '')}/api`
  : '/api';

// Base backend host URL (without '/api') for static assets like uploads
export const BACKEND_ROOT_URL = rawApiUrl
  ? rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '')
  : '';

// Helper to resolve full URL for uploaded files
export const getUploadUrl = (relativePath: string): string => {
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return BACKEND_ROOT_URL ? `${BACKEND_ROOT_URL}${cleanPath}` : cleanPath;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
