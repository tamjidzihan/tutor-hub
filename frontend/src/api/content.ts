import { apiClient } from './client';
import type { BlogPost, FAQItem, Testimonial, TeamMember, Career, GalleryItem } from '../types';

export interface PlatformStats {
  registeredTutors: number;
  liveTuitionJobs: number;
  happyParents: number;
  verifiedTeachers: number;
  satisfactionRate: number;
  avgResponseHours: number;
}

export const contentApi = {
  getStats: async (): Promise<PlatformStats> => {
    const res = await apiClient.get('/dashboard/stats/');
    return res.data;
  },

  getTestimonials: async (type?: 'PARENT' | 'TUTOR' | 'STAKEHOLDER'): Promise<Testimonial[]> => {
    const params = type ? { type } : undefined;
    const res = await apiClient.get('/testimonials/', { params });
    if (res.data?.results) return res.data.results;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  getBlogs: async (): Promise<BlogPost[]> => {
    const res = await apiClient.get('/content/blogs/');
    if (res.data?.results) return res.data.results;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  getBlogBySlug: async (slug: string): Promise<BlogPost | null> => {
    const res = await apiClient.get(`/content/blogs/${slug}/`);
    return res.data || null;
  },

  getFAQs: async (category?: string): Promise<FAQItem[]> => {
    const params = category ? { category } : undefined;
    const res = await apiClient.get('/content/faqs/', { params });
    if (res.data?.results) return res.data.results;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  getTeam: async (): Promise<TeamMember[]> => {
    const res = await apiClient.get('/content/team/');
    if (res.data?.results) return res.data.results;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  getCareers: async (): Promise<Career[]> => {
    const res = await apiClient.get('/content/careers/');
    if (res.data?.results) return res.data.results;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  getGallery: async (): Promise<GalleryItem[]> => {
    const res = await apiClient.get('/content/gallery/');
    if (res.data?.results) return res.data.results;
    if (Array.isArray(res.data)) return res.data;
    return [];
  }
};
