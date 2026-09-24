import { apiClient } from './client';
import type { TuitionJob } from '../types';

export interface JobFilterParams {
  city?: string;
  area?: string;
  subject?: string;
  class_level?: string;
  tuition_type?: string;
  gender?: string;
  salary_min?: number;
  salary_max?: number;
  search?: string;
  job_id?: string;
}

export const jobsApi = {
  getJobs: async (params?: JobFilterParams): Promise<{ count: number; results: TuitionJob[] }> => {
    const response = await apiClient.get('/jobs/', { params });
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.results)) {
        return { count: response.data.count ?? response.data.results.length, results: response.data.results };
      }
      if (Array.isArray(response.data)) {
        return { count: response.data.length, results: response.data };
      }
    }
    return { count: 0, results: [] };
  },

  getJobById: async (jobId: string): Promise<TuitionJob | null> => {
    const response = await apiClient.get(`/jobs/${jobId}/`);
    return response.data || null;
  },

  createJob: async (jobData: Partial<TuitionJob>): Promise<TuitionJob> => {
    const response = await apiClient.post('/jobs/', jobData);
    return response.data;
  },

  applyForJob: async (jobId: string, coverMessage: string, expectedSalary: number) => {
    const response = await apiClient.post('/applications/apply/', {
      job: jobId,
      cover_message: coverMessage,
      expected_salary: expectedSalary
    });
    return response.data;
  }
};
