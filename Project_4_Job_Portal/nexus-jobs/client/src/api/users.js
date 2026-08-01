import api from './axios';

export const usersApi = {
  updateProfile: (data) => api.put('/users/profile', data).then((r) => r.data),
  uploadResume: (formData) =>
    api.post('/users/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  deleteResume: () => api.delete('/users/resume').then((r) => r.data),
  uploadAvatar: (formData) =>
    api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  getUserById: (id) => api.get(`/users/${id}`).then((r) => r.data),
  deactivateAccount: () => api.delete('/users/profile').then((r) => r.data)
};
