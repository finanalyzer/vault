import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { getApiBaseUrl } from '../utils/environment';

const CLOUDFLARE_EMAIL_HEADER = 'x-user-email';
const CLOUDFLARE_JWT_COOKIE_NAME = 'CF_Authorization';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function getCloudflareJwt(): string | null {
  return getCookie(CLOUDFLARE_JWT_COOKIE_NAME);
}

export function clearCloudflareEmail(): void {
  localStorage.removeItem('cf-email');
}

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

  const cloudflareJwt = getCloudflareJwt();
  if (cloudflareJwt && !config.headers?.['Authorization']) {
    config.headers = config.headers || {};
    config.headers['Cf-Access-Jwt-Assertion'] = cloudflareJwt;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const userEmail = response.headers[CLOUDFLARE_EMAIL_HEADER];
    if (userEmail) {
      localStorage.setItem('cf-email', userEmail);
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('passxyz-token');
      localStorage.removeItem('passxyz-user');
      localStorage.removeItem('cf-email');
      window.location.href = '/vault/#/login';
    }

    if (error.response?.status === 400) {
      const errorCode = error.response.data?.error_code;
      if (errorCode === 'INVALID_CLOUDFLARE_JWT') {
        localStorage.removeItem('cf-email');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;