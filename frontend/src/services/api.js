import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://wilfredo22.pythonanywhere.com/api'
  : 'http://localhost:8000/api';
  
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    console.log(`🔍 Requisição para: ${config.url}`);
    console.log(`🔍 Token presente:`, token ? '✅ Sim' : '❌ Não');
    
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      console.log(`🔍 Header Authorization: Token ${token.substring(0, 20)}...`);
    }
    
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Erro na resposta:', error.config?.url);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Dados:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔒 Sessão expirada, redirecionando para login...');
      localStorage.removeItem('access_token');
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
  login: (data) => {
    console.log('📤 Enviando login para:', `${API_URL}/login/`);
    return api.post('/login/', data);
  },
  changePasswordFromLogin: (data) => api.post('/change-password-login/', data),
  getProfile: () => {
    console.log('📤 Buscando perfil...');
    return api.get('/user/');
  },
  updateProfile: (data) => api.put('/profile/update/', data),
  changePassword: (data) => api.post('/profile/change-password/', data),
  getUsers: (params) => api.get('/users/', { params }),
  getUser: (username) => api.get(`/user/${username}/`),
  followUser: (username) => api.post(`/user/${username}/follow/`),
  getFollowing: (username) => api.get(`/user/${username}/following/`),
  getFollowers: (username) => api.get(`/user/${username}/followers/`),
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
    if (data.location) {
      formData.append('location', data.location);
    }
    return api.post('/posts/', formData);
  },
  
  // Deletar post
  deletePost: (id) => api.delete(`/posts/${id}/`),
  
  // Like/unlike em post
  likePost: (id) => api.post(`/posts/${id}/like/`),
  
  // 👇 MÉTODOS ATUALIZADOS PARA PERFIL
  
  // Buscar posts de um usuário com filtros (tweets, tweets com mídia, etc)
  getUserPosts: (username, params = {}) => {
    let url = `/posts/?user=${username}`;
    
    if (params.type === 'replies') {
      url += '&type=replies'; // Para tweets e respostas
    } else if (params.type === 'media') {
      url += '&type=media'; // Para posts com mídia
    }
    
    console.log(`📤 Buscando posts de ${username} com tipo:`, params.type || 'tweets');
    return api.get(url);
  },
  
  // Buscar posts curtidos por um usuário
  getUserLikes: (username) => {
    console.log(`📤 Buscando curtidas de ${username}`);
    return api.get(`/posts/?user=${username}&liked=true`);
  },
  
  // Retweet
  retweetPost: (id) => api.post(`/posts/${id}/retweet/`),
};

export const commentsAPI = {
  getComments: (postId) => api.get(`/interactions/posts/${postId}/comments/`),
  createComment: (postId, data) => api.post(`/interactions/posts/${postId}/comments/`, data),
  deleteComment: (id) => api.delete(`/interactions/comments/${id}/`),
};

export const chatsAPI = {
  getConversations: () => api.get('/chats/conversations/'),
  getMessages: (conversationId) => api.get(`/chats/conversations/${conversationId}/messages/`),
  sendMessage: (data) => api.post('/chats/send/', data),
  markAsRead: (conversationId) => api.post(`/chats/conversations/${conversationId}/read/`),
  deleteConversation: (conversationId) => api.delete(`/chats/conversations/${conversationId}/`),
  deleteMessage: (messageId) => api.delete(`/chats/messages/${messageId}/`), 
};

export const notificationsAPI = {
  getNotifications: () => api.get('/notifications/'),
  markAsRead: (notificationId) => api.post('/notifications/mark-read/', { notification_id: notificationId }),
  markAllAsRead: () => api.post('/notifications/mark-all-read/'),
};

export default api;