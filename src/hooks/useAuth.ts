import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginRequest } from '../types/api';
import {
  login,
  signUp,
  getUserProfile,
  updateProfile,
  getUserByEmail,
  deleteUser,
  getUsersList,
} from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export function useLogin() {
  const auth = useAuth();

  return useMutation({
    mutationFn: async (request: LoginRequest) => {
      const response = await login(request);
      auth.login(response.token, response.user);
      return response;
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: signUp,
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    enabled: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

export function useGetUserByEmail() {
  return useMutation({
    mutationFn: getUserByEmail,
  });
}

export function useGetUsersList() {
  return useQuery({
    queryKey: ['usersList'],
    queryFn: getUsersList,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
    },
  });
}

export { useAuth };