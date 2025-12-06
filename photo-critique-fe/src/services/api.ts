import axios from 'axios';
import type { ApiResponse } from './types';

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_APP_BASE_URL}/api`,
});

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

api.interceptors.response.use(
  (response) => {
    // if response has success = false => error
    if (response.data && response.data.success === false) {
      return Promise.reject(new Error(response.data.message));
    }
    return response;
  },
  (error) => {
    // (4xx, 5xx)
    if (error.response) {
      const data: ApiResponse = error.response.data;
      if (data && data.message) {
        error.message = data.message;
      }
    }
    return Promise.reject(error);
  }
);