import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send the httpOnly auth cookie with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// If a request body is FormData (file uploads), let the browser set the
// multipart boundary itself instead of forcing application/json.
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export default api;
