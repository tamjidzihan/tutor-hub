import { apiClient } from './client';
import type { TutorRequirement } from '../types';

export const requirementsApi = {
  getMyRequirements: async (): Promise<TutorRequirement[]> => {
    const response = await apiClient.get('/requirements/');
    if (response.data?.results) return response.data.results;
    if (Array.isArray(response.data)) return response.data;
    return [];
  },

  submitRequirement: async (reqData: Partial<TutorRequirement>): Promise<TutorRequirement> => {
    const response = await apiClient.post('/requirements/', reqData);
    return response.data;
  },

  getRequirementById: async (reqId: string): Promise<TutorRequirement | null> => {
    const response = await apiClient.get(`/requirements/${reqId}/`);
    return response.data || null;
  },

  selectTutor: async (reqId: string, tutorId: string) => {
    const response = await apiClient.post(`/requirements/${reqId}/select-tutor/`, {
      tutor_id: tutorId
    });
    return response.data;
  }
};
