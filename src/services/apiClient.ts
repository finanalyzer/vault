import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { getApiBaseUrl } from '../utils/environment';

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('passxyz-token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('passxyz-token');
      localStorage.removeItem('passxyz-user');
      window.location.href = '/vault/#/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;