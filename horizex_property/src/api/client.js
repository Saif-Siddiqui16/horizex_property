import axios from 'axios';

const rawBaseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const apiBaseURL = rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL}/api`;

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT Bearer token and company context
api.interceptors.request.use(
  (config) => {
    // Normalize URL: Strip extra leading /api so calls like api.post('/api/auth/login') don't become /api/api/auth/login
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const companyContext = localStorage.getItem('companyContext');
    if (companyContext) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('x-company-context', companyContext);
      } else {
        config.headers = config.headers || {};
        config.headers['x-company-context'] = companyContext;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Unwrap backend JSON envelopes and handle 401
api.interceptors.response.use(
  (response) => {
    // If backend returns standard envelope { success: true, data: ..., meta: ... }
    if (response && response.data && response.data.success !== undefined && response.data.data !== undefined) {
      const { data, meta } = response.data;
      return {
        ...response,
        data: data,
        meta: meta || response.data.meta,
      };
    }
    return response;
  },
  (error) => {
    if (error && error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.match(/\/(login|invite)/)) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
