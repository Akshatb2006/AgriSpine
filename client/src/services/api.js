// client/src/services/api.js (Add plans endpoints)
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://agrispine.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('farmer-token');
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('farmer-token');
      localStorage.removeItem('farmer-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  refreshToken: (token) => api.post('/auth/refresh-token', { token }),
  completeOnboarding: (data) => api.post('/auth/complete-onboarding', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  initializeFarm: (data) => api.post('/auth/initialize-farm', data),
  getInitializationStatus: (jobId) => api.get(`/auth/initialization-status/${jobId}`),
};
// Dashboard API
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getAlerts: () => api.get('/dashboard/alerts'),
  getRecentTasks: () => api.get('/dashboard/recent-tasks'),
  getFieldOverview: (fieldId) => api.get(`/dashboard/field/${fieldId}`),
};
export const predictionsAPI = {
  // Existing methods
  generateYieldPrediction: (formData) => api.post('/predictions/yield', formData),
  getPredictionStatus: (predictionId) => api.get(`/predictions/yield/${predictionId}`),
  getPredictionHistory: () => api.get('/predictions/history'),
  detectDisease: (imageData) => api.post('/predictions/disease-detection', imageData),
  
  // NEW METHODS - Add these to your existing predictionsAPI:
  getAllPredictions: (params = {}) => api.get('/predictions', { params }),
  createScheduledPrediction: (data) => api.post('/predictions/schedule', data),
  processPendingPredictions: () => api.post('/predictions/process-pending'),
};


// Fields API
export const fieldsAPI = {
  getAllFields: () => api.get('/fields'),
  getField: (id) => api.get(`/fields/${id}`),
  createField: (fieldData) => api.post('/fields', fieldData),
  updateField: (id, fieldData) => api.put(`/fields/${id}`, fieldData),
  deleteField: (id) => api.delete(`/fields/${id}`),
};

// Plans API (NEW)
// Updated Plans API in client/src/services/api.js
export const plansAPI = {
  getAllPlans: (params = {}) => api.get('/plans', { params }),
  getPlan: (id) => api.get(`/plans/${id}`),
  getPlanStatus: (id) => api.get(`/plans/${id}/status`), // New status endpoint
  createPlan: (planData) => api.post('/plans', planData),
  updatePlan: (id, planData) => api.put(`/plans/${id}`, planData),
  deletePlan: (id) => api.delete(`/plans/${id}`),
  updateTaskStatus: (planId, taskId, statusData) => 
    api.put(`/plans/${planId}/tasks/${taskId}/status`, statusData),
  addTask: (planId, taskData) => api.post(`/plans/${planId}/tasks`, taskData),
  updateTask: (planId, taskId, taskData) => api.put(`/plans/${planId}/tasks/${taskId}`, taskData),
  deleteTask: (planId, taskId) => api.delete(`/plans/${planId}/tasks/${taskId}`),
};

// Tasks API
export const tasksAPI = {
  getAllTasks: () => api.get('/tasks'),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTaskStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
};

// Alerts API
export const alertsAPI = {
  getAllAlerts: () => api.get('/alerts'),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
  subscribe: (alertTypes, notificationMethods) => 
    api.post('/alerts/subscribe', { alertTypes, notificationMethods }),
};

export default api;