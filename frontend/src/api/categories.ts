import { apiClient } from './client';
import type { ServiceCategory } from '../types';

export const categoriesApi = {
  getCategories: async (): Promise<ServiceCategory[]> => {
    const response = await apiClient.get('/categories/');
    if (response.data?.results) return response.data.results;
    if (Array.isArray(response.data)) return response.data;
    return [];
  },

  getCategoryBySlug: async (slug: string): Promise<ServiceCategory | null> => {
    const response = await apiClient.get(`/categories/${slug}/`);
    return response.data || null;
  }
};
