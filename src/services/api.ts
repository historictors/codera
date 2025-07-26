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
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password, role: 'student' }),
  
  registerWithRole: (username: string, email: string, password: string, role: string, teacherProfile?: any) =>
    api.post('/auth/register', { username, email, password, role, teacherProfile }),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get('/auth/me'),
};

// Problems API
export const problemsAPI = {
  getProblems: (params?: any) => api.get('/problems', { params }),
  
  getProblem: (slug: string) => api.get(`/problems/${slug}`),
  
  createProblem: (data: any) => api.post('/problems', data),
  
  getRandomProblem: (difficulty: string) =>
    api.get(`/problems/random/arena?difficulty=${difficulty}`),
};

// Submissions API
export const submissionsAPI = {
  submit: (data: any) => api.post('/submissions', data),
  
  getUserSubmissions: (userId: string, params?: any) =>
    api.get(`/submissions/user/${userId}`, { params }),
};

// Friends API
export const friendsAPI = {
  sendRequest: (username: string) =>
    api.post('/friends/request', { username }),
  
  acceptRequest: (userId: string) =>
    api.post('/friends/accept', { userId }),
  
  declineRequest: (userId: string) =>
    api.post('/friends/decline', { userId }),
  
  removeFriend: (userId: string) =>
    api.delete('/friends/remove', { data: { userId } }),
  
  searchUsers: (params: any) => api.get('/friends/search', { params }),
};

// Arena API
export const arenaAPI = {
  createMatch: (data: any) => api.post('/arena/create', data),
  
  joinMatch: (roomId: string) => api.post(`/arena/join/${roomId}`),
  
  getMatch: (roomId: string) => api.get(`/arena/${roomId}`),
  
  findOpponent: (data: any) => api.post('/arena/find-opponent', data),
};

// Users API
export const usersAPI = {
  getProfile: (userId: string) => api.get(`/users/${userId}`),
  
  updateProfile: (data: any) => api.put('/users/profile', data),
  
  getLeaderboard: (params?: any) => api.get('/users/leaderboard/global', { params }),
};

// Contests API
export const contestsAPI = {
  getContests: (params?: any) => api.get('/contests', { params }),
  
  getContest: (contestId: string) => api.get(`/contests/${contestId}`),
  
  createContest: (data: any) => api.post('/contests/create', data),
  
  joinContest: (contestId: string) => api.post(`/contests/${contestId}/join`),
  
  submitSolution: (contestId: string, data: any) => 
    api.post(`/contests/${contestId}/submit`, data),
  
  getLeaderboard: (contestId: string) => 
    api.get(`/contests/${contestId}/leaderboard`),
  
  addAnnouncement: (contestId: string, message: string) =>
    api.post(`/contests/${contestId}/announce`, { message }),
};

// AI API
export const aiAPI = {
  reviewCode: (data: any) => api.post('/ai/code-review', data),
  
  getRoadmap: (data: any) => api.post('/ai/roadmap', data),
  
  getHint: (data: any) => api.post('/ai/hint', data),
  
  getDebugHelp: (data: any) => api.post('/ai/debug', data),
  
  getHistory: (params?: any) => api.get('/ai/history', { params }),
  
  provideFeedback: (interactionId: string, data: any) =>
    api.post(`/ai/feedback/${interactionId}`, data),
};
export default api;