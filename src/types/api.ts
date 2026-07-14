export interface LoginRequest {
  username: string;
  email?: string;
  masterPassword: string;
  takeOver?: boolean;
  deviceInfo?: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: UserProfileDto;
}

export interface UserProfileDto {
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  isDeviceLockEnabled: boolean;
  vaultFilePath: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  masterPassword: string;
  isDeviceLockEnabled?: boolean;
}

export interface ExistingSession {
  deviceInfo: string;
  loginTime: string;
  ipAddress: string;
}

export interface SessionConflictResponse {
  error: string;
  message: string;
  existingSession: ExistingSession;
  confirmUrl: string;
}

export interface UpdateProfileRequest {
  isDeviceLockEnabled?: boolean;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export type AuthState = 
  | 'unauthenticated'
  | 'cloudflare_verified'
  | 'password_required'
  | 'authenticated'
  | 'session_conflict';