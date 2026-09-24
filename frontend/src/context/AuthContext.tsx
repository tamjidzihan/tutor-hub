import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, role?: UserRole) => Promise<void>;
  register: (data: { email: string; password: string; first_name: string; last_name: string; phone: string; role: UserRole }) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('tutorhub_access_token');
    const saved = localStorage.getItem('tutorhub_user');
    if (token && saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount with backend /auth/me/
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('tutorhub_access_token');
      if (token) {
        try {
          const currentUser = await authApi.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token expired or invalid
            logout();
          }
        } catch {
          logout();
        }
      } else {
        // No token present - ensure clean unauthenticated state
        localStorage.removeItem('tutorhub_user');
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string, preferredRole?: UserRole) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, pass, preferredRole);
      localStorage.setItem('tutorhub_access_token', response.access);
      localStorage.setItem('tutorhub_refresh_token', response.refresh);
      localStorage.setItem('tutorhub_user', JSON.stringify(response.user));
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; first_name: string; last_name: string; phone: string; role: UserRole }) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      localStorage.setItem('tutorhub_access_token', response.access);
      localStorage.setItem('tutorhub_refresh_token', response.refresh);
      localStorage.setItem('tutorhub_user', JSON.stringify(response.user));
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('tutorhub_access_token');
    localStorage.removeItem('tutorhub_refresh_token');
    localStorage.removeItem('tutorhub_user');
    setUser(null);
  };

  const switchRole = async (role: UserRole) => {
    if (!user) return;
    try {
      const updated = await authApi.switchRole(role);
      setUser(updated);
      localStorage.setItem('tutorhub_user', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
