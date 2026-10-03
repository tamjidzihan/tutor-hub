import { apiClient } from './client';
import type { ReviewItem, TutorReviewsOverview } from '../types';

export const reviewsApi = {
  getTutorReviews: async (tutorId: string): Promise<TutorReviewsOverview> => {
    const res = await apiClient.get<TutorReviewsOverview>(`/reviews/tutor/${tutorId}/`);
    return res.data;
  },

  submitReview: async (data: { tutor: string; rating: number; comment: string; student_class?: string }): Promise<ReviewItem> => {
    const res = await apiClient.post<ReviewItem>('/reviews/', data);
    return res.data;
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}/`);
  },
};
