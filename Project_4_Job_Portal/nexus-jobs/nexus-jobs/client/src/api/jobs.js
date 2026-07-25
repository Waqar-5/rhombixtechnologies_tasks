import api from './axios';

export const jobsApi = {
  getJobs: (params) => api.get('/jobs', { params }).then((r) => r.data),
  getFeatured: () => api.get('/jobs/featured').then((r) => r.data),
  getBySlug: (slug) => api.get(`/jobs/${slug}`).then((r) => r.data),
  getSimilar: (slug) => api.get(`/jobs/${slug}/similar`).then((r) => r.data),
  create: (data) => api.post('/jobs', data).then((r) => r.data),
  update: (id, data) => api.put(`/jobs/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/jobs/${id}`).then((r) => r.data),
  getMine: (params) => api.get('/jobs/recruiter/mine', { params }).then((r) => r.data),
  getAnalytics: () => api.get('/jobs/recruiter/analytics').then((r) => r.data)
};
