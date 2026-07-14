import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserProfileDto, AuthState } from '../types/api';
import { logout } from '../services/authService';

interface AuthContextType {
  user: UserProfileDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authState: AuthState;
  cloudflareVerified: boolean;
  cloudflareEmail: string | null;
  login: (token: string, user: UserProfileDto) => void;
  logout: () => void;
  setCloudflareVerified: (verified: boolean, email: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cloudflareVerified, setCloudflareVerifiedState] = useState(false);
  const [cloudflareEmail, setCloudflareEmailState] = useState<string | null>(null);

  const isAuthenticated = !!user;
  const authState: AuthState = isAuthenticated 
    ? 'authenticated' 
    : cloudflareVerified 
      ? 'password_required' 
      : 'unauthenticated';

  useEffect(() => {
    const token = localStorage.getItem('passxyz-token');
    const storedUser = localStorage.getItem('passxyz-user');
    const storedCfEmail = localStorage.getItem('cf-email');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        if (userData.email) {
          localStorage.setItem('cf-email', userData.email);
        }
      } catch {
        localStorage.removeItem('passxyz-user');
        localStorage.removeItem('passxyz-token');
      }
    }

    if (storedCfEmail) {
      setCloudflareVerifiedState(true);
      setCloudflareEmailState(storedCfEmail);
    }

    setIsLoading(false);
  }, []);

  const login = useCallback((token: string, userData: UserProfileDto) => {
    if (!token) return;
    localStorage.setItem('passxyz-token', token);
    if (userData) {
      localStorage.setItem('passxyz-user', JSON.stringify(userData));
      setUser(userData);
      if (userData.email) {
        localStorage.setItem('cf-email', userData.email);
        setCloudflareEmailState(userData.email);
      }
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch {
    } finally {
      localStorage.removeItem('passxyz-token');
      localStorage.removeItem('passxyz-user');
      localStorage.removeItem('cf-email');
      setUser(null);
      setCloudflareVerifiedState(false);
      setCloudflareEmailState(null);
    }
  }, []);

  const setCloudflareVerified = useCallback((verified: boolean, email: string | null) => {
    setCloudflareVerifiedState(verified);
    setCloudflareEmailState(email);
    if (verified && email) {
      localStorage.setItem('cf-email', email);
    } else {
      localStorage.removeItem('cf-email');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authState,
        cloudflareVerified,
        cloudflareEmail,
        login,
        logout: handleLogout,
        setCloudflareVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}