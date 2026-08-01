import api from './axios';

export const applicationsApi = {
  apply: (jobId, data) => api.post(`/applications/${jobId}`, data).then((r) => r.data),
  withdraw: (id) => api.delete(`/applications/${id}`).then((r) => r.data),
  getMine: (params) => api.get('/applications/mine', { params }).then((r) => r.data),
  getForJob: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }).then((r) => r.data),
  getAllForRecruiter: (params) => api.get('/applications/recruiter/all', { params }).then((r) => r.data),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data).then((r) => r.data),
  getById: (id) => api.get(`/applications/${id}`).then((r) => r.data)
};
