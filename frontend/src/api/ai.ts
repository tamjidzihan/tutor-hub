import { apiClient } from './client';
import type { TutorRecommendation, ReviewAIInsights } from '../types';

export const aiApi = {
  getStatus: async (): Promise<{ provider: string; model: string; has_api_key: boolean; features: string[] }> => {
    const res = await apiClient.get('/ai/status/');
    return res.data;
  },

  recommendTutors: async (preferences: {
    subject?: string;
    max_budget?: number;
    location?: string;
    class_level?: string;
    curriculum?: string;
  }): Promise<{ results: TutorRecommendation[]; total_matches: number; applied_preferences: any }> => {
    const res = await apiClient.post('/ai/recommend-tutors/', preferences);
    return res.data;
  },

  summarizeTutorReviews: async (tutorId: string): Promise<ReviewAIInsights> => {
    const res = await apiClient.post('/ai/summarize-tutor-reviews/', { tutor_id: tutorId });
    return res.data;
  },
};
