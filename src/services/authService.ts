import axios from 'axios';
import { getApiBaseUrl } from '../utils/environment';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
});

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    
    if (credentials.rememberMe) {
      localStorage.setItem('passxyz-email', credentials.email);
      localStorage.setItem('passxyz-remember-me', 'true');
    } else {
      localStorage.removeItem('passxyz-email');
      localStorage.removeItem('passxyz-remember-me');
    }

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: 'Login failed. Please check your credentials.',
    };
  }
}

export function getSavedEmail(): string | null {
  const rememberMe = localStorage.getItem('passxyz-remember-me');
  if (rememberMe === 'true') {
    return localStorage.getItem('passxyz-email');
  }
  return null;
}

export function logout(): void {
  localStorage.removeItem('passxyz-token');
  localStorage.removeItem('passxyz-email');
  localStorage.removeItem('passxyz-remember-me');
}

export function isAuthenticated(): boolean {
  return localStorage.getItem('passxyz-token') !== null;
}