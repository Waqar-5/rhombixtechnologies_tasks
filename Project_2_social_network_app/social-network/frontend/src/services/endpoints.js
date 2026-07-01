import api from './api';

// --- Auth ---
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// --- Users ---
export const userService = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/me', data),
  updatePrivacy: (data) => api.put('/users/me/privacy', data),
  uploadAvatar: (formData) => api.post('/users/me/avatar', formData),
  uploadCover: (formData) => api.post('/users/me/cover', formData),
  search: (q) => api.get('/users/search', { params: { q } }),
  getSuggestions: () => api.get('/users/suggestions'),
  getFriendsOf: (username) => api.get(`/users/${username}/friends`),
  getSavedPosts: () => api.get('/users/me/saved'),
};

// --- Friends ---
export const friendService = {
  sendRequest: (userId) => api.post(`/friends/request/${userId}`),
  acceptRequest: (requestId) => api.put(`/friends/accept/${requestId}`),
  declineRequest: (requestId) => api.put(`/friends/decline/${requestId}`),
  cancelRequest: (requestId) => api.delete(`/friends/cancel/${requestId}`),
  unfriend: (userId) => api.delete(`/friends/${userId}`),
  getReceived: () => api.get('/friends/requests/received'),
  getSent: () => api.get('/friends/requests/sent'),
  getMyFriends: () => api.get('/friends'),
};

// --- Posts ---
export const postService = {
  create: (formData) => api.post('/posts', formData),
  getFeed: (page = 1) => api.get('/posts/feed', { params: { page } }),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  getById: (postId) => api.get(`/posts/${postId}`),
  toggleLike: (postId) => api.put(`/posts/${postId}/like`),
  delete: (postId) => api.delete(`/posts/${postId}`),
  edit: (postId, data) => api.put(`/posts/${postId}`, data),
  toggleSave: (postId) => api.put(`/posts/${postId}/save`),
  share: (postId) => api.post(`/posts/${postId}/share`),
};

// --- Comments ---
export const commentService = {
  getForPost: (postId) => api.get(`/comments/${postId}`),
  add: (postId, data) => api.post(`/comments/${postId}`, data),
  toggleLike: (commentId) => api.put(`/comments/${commentId}/like`),
  edit: (commentId, text) => api.put(`/comments/${commentId}`, { text }),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
};

// --- Notifications ---
export const notificationService = {
  getAll: (page = 1) => api.get('/notifications', { params: { page } }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};
