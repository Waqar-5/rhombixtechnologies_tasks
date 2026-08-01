import axios from 'axios';

// In local dev, /api is proxied to localhost:5000 by Vite (vite.config.js), so no
// env var is needed. In a split production deployment (frontend and backend on
// different domains), set VITE_API_URL to the full backend URL, e.g.
// https://your-backend.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  withCredentials: true
});

// Attach bearer token from localStorage as a fallback to the httpOnly cookie
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error messages so components can just read err.message. Also
// preserves a structured err.code when the backend sends one (e.g.
// 'EMAIL_NOT_VERIFIED'), so components can branch on the specific error
// instead of pattern-matching the message string.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const message = data?.message || error.message || 'Something went wrong. Please try again.';
    const normalized = new Error(message);
    normalized.code = data?.code;
    normalized.status = error.response?.status;
    return Promise.reject(normalized);
  }
);

export default api;
