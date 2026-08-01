import api from './axios';

export const categoriesApi = {
  getAll: () => api.get('/categories').then((r) => r.data),
  create: (data) => api.post('/categories', data).then((r) => r.data)
};
