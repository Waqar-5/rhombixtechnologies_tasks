import api from './axios';

export const companiesApi = {
  getAll: (params) => api.get('/companies', { params }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/companies/${slug}`).then((r) => r.data),
  getMine: () => api.get('/companies/me').then((r) => r.data),
  updateMine: (data) => api.put('/companies/me', data).then((r) => r.data),
  uploadLogo: (formData) =>
    api.post('/companies/me/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  uploadCover: (formData) =>
    api.post('/companies/me/cover', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
};
