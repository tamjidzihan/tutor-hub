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

export interface JobListResponse {
  count: number;
  total_pages: number;
  current_page: number;
  results: TuitionJob[];
}

export const jobsApi = {
  getJobs: async (params?: JobFilterParams, page = 1, pageSize = 6): Promise<JobListResponse> => {
    const requestParams = { ...params, page, page_size: pageSize };
    if (requestParams.gender === 'Any') delete requestParams.gender;
    const response = await apiClient.get('/jobs/', { params: requestParams });
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.results)) {
        return {
          count: response.data.count ?? response.data.results.length,
          total_pages: response.data.total_pages ?? 1,
          current_page: response.data.current_page ?? page,
          results: response.data.results,
        };
      }
      if (Array.isArray(response.data)) {
        return { count: response.data.length, total_pages: 1, current_page: 1, results: response.data };
      }
    }
    return { count: 0, total_pages: 0, current_page: page, results: [] };
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
