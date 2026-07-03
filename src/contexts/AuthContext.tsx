import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserProfileDto } from '../types/api';
import { logout } from '../services/authService';

interface AuthContextType {
  user: UserProfileDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfileDto) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('passxyz-token');
    const storedUser = localStorage.getItem('passxyz-user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string, userData: UserProfileDto) => {
    localStorage.setItem('passxyz-token', token);
    localStorage.setItem('passxyz-user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch {
    } finally {
      localStorage.removeItem('passxyz-token');
      localStorage.removeItem('passxyz-user');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout: handleLogout,
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