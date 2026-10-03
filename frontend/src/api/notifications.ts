import { apiClient } from './client';
import type { AppNotification } from '../types';

export const notificationsApi = {
  getNotifications: async (): Promise<{ unread_count: number; notifications: AppNotification[] }> => {
    const res = await apiClient.get<{ unread_count: number; notifications: AppNotification[] }>('/notifications/');
    return res.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read/`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all/');
  },
};
