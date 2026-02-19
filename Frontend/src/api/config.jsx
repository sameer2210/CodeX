import axios from 'axios';
import { notify } from '../lib/notify';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
  timeout: 15000,
  timeoutErrorMessage: 'Request timed out. Please try again.',
});

// Attach token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('codex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Handle 401
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthRequest =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
    const isAuthPage =
      window.location.pathname === '/login' || window.location.pathname === '/register';

    if (status === 401 && !isAuthRequest && !isAuthPage) {
      localStorage.clear();
      window.location.href = '/login';
    }

    notify(error.response?.data?.message || 'Network error', 'error');
    return Promise.reject(error);
  }
);

export default api;
