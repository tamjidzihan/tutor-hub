import { apiClient } from './client';
import type { JobApplication } from '../types';

export const applicationsApi = {
  getMyApplications: async (): Promise<JobApplication[]> => {
    const response = await apiClient.get('/applications/my/');
    if (response.data?.results) return response.data.results;
    if (Array.isArray(response.data)) return response.data;
    return [];
  },

  applyForJob: async (jobId: string, coverMessage: string, expectedSalary: number): Promise<JobApplication> => {
    const response = await apiClient.post('/applications/apply/', {
      job: jobId,
      cover_message: coverMessage,
      expected_salary: expectedSalary
    });
    return response.data;
  },

  getApplicationsForJob: async (jobId: string): Promise<JobApplication[]> => {
    const response = await apiClient.get(`/applications/job/${jobId}/`);
    if (response.data?.results) return response.data.results;
    if (Array.isArray(response.data)) return response.data;
    return [];
  },

  withdrawApplication: async (appId: string): Promise<void> => {
    await apiClient.delete(`/applications/${appId}/`);
  }
};

