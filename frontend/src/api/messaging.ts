import { apiClient } from './client';
import type { Conversation, Message } from '../types';

export const messagingApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const res = await apiClient.get<Conversation[]>('/conversations/');
    return res.data;
  },

  startConversation: async (params: { target_user_id?: string; tutor_id?: string }): Promise<Conversation> => {
    const res = await apiClient.post<Conversation>('/conversations/', params);
    return res.data;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const res = await apiClient.get<Message[]>(`/conversations/${conversationId}/messages/`);
    return res.data;
  },

  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const res = await apiClient.post<Message>(`/conversations/${conversationId}/messages/`, { content });
    return res.data;
  },

  markAsRead: async (conversationId: string): Promise<{ success: boolean; marked_read: number }> => {
    const res = await apiClient.post<{ success: boolean; marked_read: number }>(`/conversations/${conversationId}/read/`);
    return res.data;
  },
};
