import { apiClient } from './client';
import type { Post, PostComment, PostCategory } from '../types';

export const postsApi = {
  getPosts: async (params?: { category?: string; search?: string; for_you?: boolean }): Promise<Post[]> => {
    const res = await apiClient.get<Post[] | { results: Post[] }>('/posts/', { params });
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return (res.data as { results: Post[] }).results || [];
  },

  createPost: async (data: { content: string; category: PostCategory; tags?: string[] }): Promise<Post> => {
    const res = await apiClient.post<Post>('/posts/', data);
    return res.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/`);
  },

  toggleLike: async (postId: string): Promise<{ is_liked: boolean; likes_count: number }> => {
    const res = await apiClient.post<{ is_liked: boolean; likes_count: number }>(`/posts/${postId}/like/`);
    return res.data;
  },

  getComments: async (postId: string): Promise<PostComment[]> => {
    const res = await apiClient.get<PostComment[]>(`/posts/${postId}/comments/`);
    return res.data;
  },

  addComment: async (postId: string, content: string): Promise<PostComment> => {
    const res = await apiClient.post<PostComment>(`/posts/${postId}/comments/`, { content });
    return res.data;
  },

  reportPost: async (postId: string, reason: string): Promise<void> => {
    await apiClient.post(`/posts/${postId}/report/`, { reason });
  },
};
