import axios from 'axios';
import { config } from './config';

const API_URL = `${config.apiUrl}/user`;

// Create axios instance with default config
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
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

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

const getProfile = async () => {
  const response = await api.get(`${API_URL}/me`);
  return response.data;
};

const updateProfile = async (userData) => {
  const response = await api.put(`${API_URL}/me`, userData);
  return response.data;
};

const changePassword = async (passwords) => {
  const response = await api.put(`${API_URL}/password`, passwords);
  return response.data;
};

export const userService = {
  getProfile,
  updateProfile,
  changePassword,
};
