import api from './axios';

export const savedJobsApi = {
  getAll: (params) => api.get('/saved-jobs', { params }).then((r) => r.data),
  save: (jobId) => api.post(`/saved-jobs/${jobId}`).then((r) => r.data),
  unsave: (jobId) => api.delete(`/saved-jobs/${jobId}`).then((r) => r.data)
};
