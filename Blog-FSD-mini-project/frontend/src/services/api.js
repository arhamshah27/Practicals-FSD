import axios from 'axios';

// Determine and normalize base URL
const rawBase = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || '/api';
const baseURL = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`;

// Create axios instance
const http = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async (userData) => (await http.post('/auth/signup', userData)).data,
  login: async (credentials) => (await http.post('/auth/login', credentials)).data,
  logout: async () => (await http.post('/auth/logout')).data,
  getMe: async () => (await http.get('/auth/me')).data,
  updateProfile: async (profileData) => (await http.put('/auth/profile', profileData)).data,
  changePassword: async (passwordData) => (await http.put('/auth/password', passwordData)).data,
  refreshToken: async () => (await http.post('/auth/refresh')).data,
};

// Blogs API
export const blogsAPI = {
  getAll: (params) => http.get('/blogs', { params }),
  getById: (id) => http.get(`/blogs/${id}`),
  getBySlug: (slug) => http.get(`/blogs/slug/${slug}`),
  getRecommendations: (params) => http.get('/blogs/recommendations', { params }),
  getByMood: (mood, params) => http.get(`/blogs/mood/${mood}`, { params }),
  create: (blogData) => http.post('/blogs', blogData),
  update: (id, blogData) => http.put(`/blogs/${id}`, blogData),
  delete: (id) => http.delete(`/blogs/${id}`),
  publish: (id) => http.post(`/blogs/${id}/publish`),
  like: (id) => http.post(`/blogs/${id}/like`),
  addComment: (id, commentData) => http.post(`/blogs/${id}/comments`, commentData),
  updateComment: (id, commentId, commentData) => http.put(`/blogs/${id}/comments/${commentId}`, commentData),
  deleteComment: (id, commentId) => http.delete(`/blogs/${id}/comments/${commentId}`),
};

// Users API
export const usersAPI = {
  getProfile: (username) => http.get(`/users/profile/${username}`),
  search: (query, params) => http.get('/users/search', { params: { q: query, ...params } }),
  follow: (userId) => http.post(`/users/follow/${userId}`),
  unfollow: (userId) => http.post(`/users/unfollow/${userId}`),
  getFollowing: () => http.get('/users/following'),
  getFollowers: () => http.get('/users/followers'),
  getLikedBlogs: (params) => http.get('/users/liked-blogs', { params }),
  getReadingHistory: (params) => http.get('/users/reading-history', { params }),
  updatePreferences: (preferences) => http.put('/users/preferences', preferences),
  getStats: () => http.get('/users/stats'),
};

// Chat API
export const chatAPI = {
  getRooms: () => http.get('/chat/rooms'),
  createRoom: (roomData) => http.post('/chat/rooms', roomData),
  getRoom: (roomId) => http.get(`/chat/rooms/${roomId}`),
  sendMessage: (roomId, messageData) => http.post(`/chat/rooms/${roomId}/messages`, messageData),
  updateMessage: (roomId, messageId, messageData) => http.put(`/chat/rooms/${roomId}/messages/${messageId}`, messageData),
  deleteMessage: (roomId, messageId) => http.delete(`/chat/rooms/${roomId}/messages/${messageId}`),
  addParticipant: (roomId, participantData) => http.post(`/chat/rooms/${roomId}/participants`, participantData),
  removeParticipant: (roomId, userId) => http.delete(`/chat/rooms/${roomId}/participants/${userId}`),
  searchUsers: (query, params) => http.get('/chat/search', { params: { q: query, ...params } }),
};

// File upload API
export const uploadAPI = {
  uploadImage: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return http.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return http.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
};

// AI/Helper API
export const aiAPI = {
  generateSummary: (content, maxLength) => http.post('/ai/summary', { content, maxLength }),
  analyzeMood: (content) => http.post('/ai/mood', { content }),
  getContentSuggestions: (content, category) => http.post('/ai/suggestions', { content, category }),
  generateSpeech: (text, voice) => http.post('/ai/speech', { text, voice }),
};

// Utility functions
export const apiUtils = {
  // Get full URL for images
  getImageUrl: (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${path}`;
  },
  
  // Format error message
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },
  
  // Check if error is network error
  isNetworkError: (error) => {
    return !error.response && error.request;
  },
  
  // Check if error is server error
  isServerError: (error) => {
    return error.response?.status >= 500;
  },
  
  // Check if error is client error
  isClientError: (error) => {
    return error.response?.status >= 400 && error.response?.status < 500;
  },
  
  // Retry request with exponential backoff
  retryRequest: async (requestFn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },
};

export default http;

// Compatibility wrapper matching existing frontend usage
export const api = {
  ai: {
    generateSummary: async ({ content, style }) => {
      const res = await http.post('/ai/summary', { content, style });
      const summary = res.data?.data?.summary || res.data?.summary;
      return { data: { summary } };
    },
  },
  blogs: {
    getBlogs: async (params) => {
      const res = await blogsAPI.getAll(params);
      return {
        data: res.data?.blogs ?? res.data,
        totalPages: res.data?.totalPages,
        currentPage: res.data?.currentPage,
        total: res.data?.total,
      };
    },
    getMoodBlogs: async (mood, params) => {
      const res = await blogsAPI.getByMood(mood, params);
      return {
        data: res.data?.blogs ?? res.data,
        totalPages: res.data?.totalPages,
        currentPage: res.data?.currentPage,
        total: res.data?.total,
      };
    },
    getBlogBySlug: async (slug) => {
      const res = await blogsAPI.getBySlug(slug);
      return { data: res.data?.blog ?? res.data };
    },
    getOwnBlogBySlug: async (slug) => {
      const res = await http.get(`/blogs/mine/${slug}`);
      return { data: res.data?.blog ?? res.data };
    },
    createBlog: async (data) => ({ data: (await blogsAPI.create(data)).data }),
    updateBlog: async (id, data) => ({ data: (await blogsAPI.update(id, data)).data }),
    deleteBlog: async (id) => ({ data: (await blogsAPI.delete(id)).data }),
    publishBlog: async (id) => ({ data: (await blogsAPI.publish(id)).data }),
    toggleLike: async (id) => ({ data: (await blogsAPI.like(id)).data }),
    addComment: async (id, data) => ({ data: (await blogsAPI.addComment(id, data)).data }),
    updateComment: async (id, commentId, data) => ({ data: (await blogsAPI.updateComment(id, commentId, data)).data }),
    deleteComment: async (id, commentId) => ({ data: (await blogsAPI.deleteComment(id, commentId)).data }),
    incrementViews: async () => Promise.resolve(),
    getUserBlogs: async (params = {}) => {
      if (params.status || params.mine) {
        const res = await http.get('/blogs/mine', { params });
        return {
          data: res.data?.blogs ?? res.data,
          totalPages: res.data?.totalPages,
          currentPage: res.data?.currentPage,
          total: res.data?.total,
        };
      }
      const res = await blogsAPI.getAll(params);
      return { data: res.data?.blogs ?? res.data };
    },
  },
  users: {
    getUserByUsername: async (username) => ({ data: (await usersAPI.getProfile(username)).data?.profile }),
    getUserStats: async () => ({ data: (await usersAPI.getStats()).data?.stats }),
    getReadingHistory: async (params) => ({ data: (await usersAPI.getReadingHistory(params)).data?.blogs }),
    searchUsers: async (query, params) => ({ data: (await usersAPI.search(query, params)).data?.users }),
  },
  chat: {
    getChatRooms: async () => {
      const res = await http.get('/chat/rooms');
      return { data: res.data.chatRooms };
    },
    getRoomMessages: async (roomId) => {
      const res = await http.get(`/chat/rooms/${roomId}`);
      return { data: res.data.chatRoom?.messages || [] };
    },
    sendMessage: async ({ roomId, content, type = 'text', sharedBlog, mediaUrl, fileName, fileSize }) => {
      const payload = {
        content,
        messageType: type,
        sharedBlogId: sharedBlog?.id,
        mediaUrl,
        fileName,
        fileSize,
      };
      const res = await http.post(`/chat/rooms/${roomId}/messages`, payload);
      const message = res.data?.data || res.data?.message || res.data;
      return { data: message };
    },
    createChatRoom: async ({ type, participants, name, description }) => {
      const res = await http.post('/chat/rooms', { type, participants, name, description });
      return { data: res.data.chatRoom || res.data };
    },
  },
  upload: {
    image: (file, onUploadProgress) => uploadAPI.uploadImage(file, onUploadProgress),
    file: (file, onUploadProgress) => uploadAPI.uploadFile(file, onUploadProgress),
  },
};