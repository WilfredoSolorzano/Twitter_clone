import axios from 'axios';

// Configuración dinámica para desarrollo/producción
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://wilfredo22.pythonanywhere.com/api'  //backend en PythonAnywhere
  : 'http://localhost:8000/api';                  // Desarrollo local

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const socialAuthAPI = {
  googleLogin: (token) => api.post('/google-login/', { token }),
  appleLogin: (token, firstName = '', lastName = '') => 
    api.post('/apple-login/', { 
      token, 
      first_name: firstName, 
      last_name: lastName 
    }),
};

export const authAPI = {
  register: (data) => api.post('/register/', data),
  login: (data) => api.post('/login/', data),
  getProfile: () => api.get('/user/'),
  updateProfile: (data) => api.put('/profile/update/', data),
  getUser: (username) => api.get(`/user/${username}/`),
  followUser: (username) => api.post(`/user/${username}/follow/`),
};

export const postsAPI = {
  getPosts: (params) => api.get('/posts/', { params }),
  getFeed: () => api.get('/posts/?feed=true'),
  createPost: (data) => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.image) {
      formData.append('image', data.image);
    }
    return api.post('/posts/', formData);
  },
  deletePost: (id) => api.delete(`/posts/${id}/`),
  likePost: (id) => api.post(`/posts/${id}/like/`),
};

export const commentsAPI = {
  getComments: (postId) => api.get(`/posts/${postId}/comments/`),
  createComment: (postId, data) => api.post(`/posts/${postId}/comments/`, data),
  deleteComment: (id) => api.delete(`/comments/${id}/`),
};

export default api;