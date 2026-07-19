import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('skyline_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const authService = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data)
};

export const catalogService = {
  destinations: (params) => api.get('/destinations', { params }).then((r) => r.data.results),
  destination: (id) => api.get(`/destinations/${id}`).then((r) => r.data.destination),
  hotels: (params) => api.get('/hotels', { params }).then((r) => r.data.results),
  hotel: (id) => api.get(`/hotels/${id}`).then((r) => r.data.hotel),
  flights: (params) => api.get('/flights', { params }).then((r) => r.data.results),
  flight: (id) => api.get(`/flights/${id}`).then((r) => r.data.flight),
  origins: () => api.get('/origins').then((r) => r.data.results)
};

export const bookingService = {
  create: (payload) => api.post('/bookings', payload).then((r) => r.data.booking),
  mine: () => api.get('/bookings').then((r) => r.data.results),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data.booking),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`).then((r) => r.data.booking)
};

export default api;
