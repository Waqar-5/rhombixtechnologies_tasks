import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token, password) =>
    api.put(`/auth/reset-password/${token}`, { password }).then((r) => r.data),
  changePassword: (data) => api.put('/auth/change-password', data).then((r) => r.data),
  resendVerification: () => api.post('/auth/resend-verification').then((r) => r.data)
};
