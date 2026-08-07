import api from './api';

export const categoryService = {
  getCategories: (params) => api.get('/categories', { params }),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  createCategory: (formData) =>
    api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCategory: (id, formData) =>
    api.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const tagService = {
  getTags: (params) => api.get('/tags', { params }),
  getTagBySlug: (slug) => api.get(`/tags/${slug}`),
  createTag: (name) => api.post('/tags', { name }),
  updateTag: (id, name) => api.put(`/tags/${id}`, { name }),
  deleteTag: (id) => api.delete(`/tags/${id}`),
};

export const userService = {
  updateProfile: (payload) => api.put('/users/profile', payload),
  updateAvatar: (formData) =>
    api.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAuthorProfile: (id) => api.get(`/users/${id}`),
  deleteAccount: (password) => api.delete('/users/me', { data: { password } }),
};

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),

  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, payload) => api.patch(`/admin/users/${id}`, payload),
  blockUser: (id) => api.patch(`/admin/users/${id}/block`),
  unblockUser: (id) => api.patch(`/admin/users/${id}/unblock`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  getAllBlogs: (params) => api.get('/admin/blogs', { params }),
  toggleFeature: (id) => api.patch(`/admin/blogs/${id}/feature`),
  approveBlog: (id) => api.patch(`/admin/blogs/${id}/approve`),
  rejectBlog: (id, reason) => api.patch(`/admin/blogs/${id}/reject`, { reason }),
  deleteBlog: (id) => api.delete(`/admin/blogs/${id}`),

  getAllComments: (params) => api.get('/admin/comments', { params }),
  updateCommentStatus: (id, status) => api.patch(`/admin/comments/${id}/status`, { status }),
  deleteComment: (id) => api.delete(`/admin/comments/${id}`),
};
