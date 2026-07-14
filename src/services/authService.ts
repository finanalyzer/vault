import apiClient, { getCloudflareJwt, clearCloudflareEmail } from './apiClient';
import type { LoginRequest } from '../types/api';
import type { LoginResponse } from '../types/api';
import type { UserProfileDto } from '../types/api';
import type { SignUpRequest } from '../types/api';

import type { UpdateProfileRequest } from '../types/api';

export { getCloudflareJwt, clearCloudflareEmail };

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/user/login', request);
  return response.data;
}

export async function signUp(request: SignUpRequest): Promise<UserProfileDto> {
  const response = await apiClient.post<UserProfileDto>('/user/signup', request);
  return response.data;
}

export async function getUserByEmail(email: string): Promise<UserProfileDto | null> {
  try {
    const response = await apiClient.get<UserProfileDto>(`/user/by-email?email=${encodeURIComponent(email)}`);
    return response.data;
  } catch {
    return null;
  }
}

export async function getUserProfile(): Promise<UserProfileDto> {
  const response = await apiClient.get<UserProfileDto>('/user/profile');
  return response.data;
}

export async function updateProfile(request: UpdateProfileRequest): Promise<UserProfileDto> {
  const response = await apiClient.put<UserProfileDto>('/user/profile', request);
  return response.data;
}

export async function getUsersList(): Promise<UserProfileDto[]> {
  const response = await apiClient.get<UserProfileDto[]>('/user/users');
  return response.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/user/${userId}`);
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await apiClient.post('/user/change-password', { oldPassword, newPassword });
}

export async function logout(): Promise<void> {
  await apiClient.post('/user/logout');
}

export async function verifySession(): Promise<void> {
  await apiClient.get('/user/verify-session');
}