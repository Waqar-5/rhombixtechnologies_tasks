import api from './api';

export const blogService = {
  getBlogs: (params) => api.get('/blogs', { params }),
  getMyBlogs: (params) => api.get('/blogs/my-blogs', { params }),
  getBlogById: (id) => api.get(`/blogs/id/${id}`),
  getBlogBySlug: (slug) => api.get(`/blogs/${slug}`),
  getRelatedBlogs: (slug) => api.get(`/blogs/${slug}/related`),
  createBlog: (formData) =>
    api.post('/blogs', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBlog: (id, formData) =>
    api.put(`/blogs/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),

  getComments: (blogId, params) => api.get(`/blogs/${blogId}/comments`, { params }),
  addComment: (blogId, payload) => api.post(`/blogs/${blogId}/comments`, payload),
  getReplies: (commentId) => api.get(`/comments/${commentId}/replies`),
  updateComment: (id, content) => api.put(`/comments/${id}`, { content }),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  likeComment: (id) => api.post(`/comments/${id}/like`),
  reportComment: (id, reason) => api.post(`/comments/${id}/report`, { reason }),

  toggleLike: (blogId) => api.post(`/blogs/${blogId}/like`),
  getBlogLikers: (blogId) => api.get(`/blogs/${blogId}/likes`),
  toggleBookmark: (blogId) => api.post(`/blogs/${blogId}/bookmark`),
  getMyBookmarks: (params) => api.get('/bookmarks', { params }),
};
