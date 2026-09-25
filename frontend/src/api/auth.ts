import { apiClient } from './client';
import type { User, UserRole } from '../types';

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export const authApi = {
  login: async (email: string, pass: string, role?: UserRole): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login/', {
      email,
      password: pass,
      role
    });

    const data: AuthResponse = response.data;
    if (data?.access) {
      localStorage.setItem('tutorhub_access_token', data.access);
      localStorage.setItem('tutorhub_refresh_token', data.refresh);
      localStorage.setItem('tutorhub_user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: UserRole;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register/', userData);
    const data: AuthResponse = response.data;
    if (data?.access) {
      localStorage.setItem('tutorhub_access_token', data.access);
      localStorage.setItem('tutorhub_refresh_token', data.refresh);
      localStorage.setItem('tutorhub_user', JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/auth/me/');
      if (response.data) {
        localStorage.setItem('tutorhub_user', JSON.stringify(response.data));
        return response.data;
      }
    } catch {
      // Not authenticated or token expired
    }
    return null;
  },

  updateCurrentUser: async (data: Pick<User, 'first_name' | 'last_name' | 'phone'>): Promise<User> => {
    const response = await apiClient.patch('/auth/me/', data);
    localStorage.setItem('tutorhub_user', JSON.stringify(response.data));
    return response.data;
  },

  switchRole: async (newRole: UserRole): Promise<User> => {
    const response = await apiClient.post('/auth/switch-role/', { role: newRole });
    const updatedUser = response.data.user;
    localStorage.setItem('tutorhub_user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  logout: () => {
    localStorage.removeItem('tutorhub_access_token');
    localStorage.removeItem('tutorhub_refresh_token');
    localStorage.removeItem('tutorhub_user');
  }
};
