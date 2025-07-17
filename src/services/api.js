import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password, role: 'student' }),
  
  registerWithRole: (username, email, password, role, teacherProfile) =>
    api.post('/auth/register', { username, email, password, role, teacherProfile }),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get('/auth/me'),
};

// Problems API
export const problemsAPI = {
  getProblems: (params) => api.get('/problems', { params }),
  
  getProblem: (slug) => api.get(`/problems/${slug}`),
  
  createProblem: (data) => api.post('/problems', data),
  
  getRandomProblem: (difficulty) =>
    api.get(`/problems/random/arena?difficulty=${difficulty}`),
};

// Submissions API
export const submissionsAPI = {
  submit: (data) => api.post('/submissions', data),
  
  getUserSubmissions: (userId, params) =>
    api.get(`/submissions/user/${userId}`, { params }),
};

// Friends API
export const friendsAPI = {
  sendRequest: (username) =>
    api.post('/friends/request', { username }),
  
  acceptRequest: (userId) =>
    api.post('/friends/accept', { userId }),
  
  declineRequest: (userId) =>
    api.post('/friends/decline', { userId }),
  
  removeFriend: (userId) =>
    api.delete('/friends/remove', { data: { userId } }),
  
  searchUsers: (params) => api.get('/friends/search', { params }),
};

// Arena API
export const arenaAPI = {
  createMatch: (data) => api.post('/arena/create', data),
  
  joinMatch: (roomId) => api.post(`/arena/join/${roomId}`),
  
  getMatch: (roomId) => api.get(`/arena/${roomId}`),
  
  findOpponent: (data) => api.post('/arena/find-opponent', data),
};

// Users API
export const usersAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  
  updateProfile: (data) => api.put('/users/profile', data),
  
  getLeaderboard: (params) => api.get('/users/leaderboard/global', { params }),
};

// Contests API
export const contestsAPI = {
  getContests: (params) => api.get('/contests', { params }),
  
  getContest: (contestId) => api.get(`/contests/${contestId}`),
  
  createContest: (data) => api.post('/contests/create', data),
  
  joinContest: (contestId) => api.post(`/contests/${contestId}/join`),
  
  submitSolution: (contestId, data) => 
    api.post(`/contests/${contestId}/submit`, data),
  
  getLeaderboard: (contestId) => 
    api.get(`/contests/${contestId}/leaderboard`),
  
  addAnnouncement: (contestId, message) =>
    api.post(`/contests/${contestId}/announce`, { message }),
};

// AI API
export const aiAPI = {
  reviewCode: (data) => api.post('/ai/code-review', data),
  
  getRoadmap: (data) => api.post('/ai/roadmap', data),
  
  getHint: (data) => api.post('/ai/hint', data),
  
  getDebugHelp: (data) => api.post('/ai/debug', data),
  
  getHistory: (params) => api.get('/ai/history', { params }),
  
  provideFeedback: (interactionId, data) =>
    api.post(`/ai/feedback/${interactionId}`, data),
};

export default api;