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
    const firstPage = await apiClient.get(`/applications/job/${jobId}/`, {
      params: { page: 1, page_size: 100 },
    });
    if (Array.isArray(firstPage.data)) return firstPage.data;

    const results: JobApplication[] = firstPage.data?.results || [];
    const totalPages = Number(firstPage.data?.total_pages || 1);
    if (totalPages <= 1) return results;

    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        apiClient.get(`/applications/job/${jobId}/`, {
          params: { page: index + 2, page_size: 100 },
        })
      )
    );
    return results.concat(...remainingPages.map((response) => response.data?.results || []));
  },

  selectTutor: async (applicationId: string): Promise<JobApplication> => {
    const response = await apiClient.post(`/applications/${applicationId}/select/`);
    return response.data.application || response.data;
  },

  markSeen: async (applicationId: string): Promise<void> => {
    await apiClient.post(`/applications/${applicationId}/seen/`);
  },

  withdrawApplication: async (appId: string): Promise<void> => {
    await apiClient.delete(`/applications/${appId}/`);
  }
};
