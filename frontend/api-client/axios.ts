import axios from 'axios';
import { tokenStorage } from '@/utils/tokenStorage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://orchestra-y8vf.onrender.com';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data?.data ?? response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clearToken();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
