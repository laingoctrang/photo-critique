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
      const errorMessage: string[] = [];
      if (data?.globalErrors) {
        errorMessage.push(...data.globalErrors);
      }

      if (data?.fieldErrors) {
        Object.entries(data.fieldErrors).forEach(([_key, value]) => {
          errorMessage.push(value);
        });
      }

      if (data && data.message && errorMessage.length === 0) {
        errorMessage.push(data.message);
      }

      if (errorMessage.length > 0) {
        return Promise.reject(new Error(errorMessage.join(", ")));
      }
    }
    return Promise.reject(error);
  }
);