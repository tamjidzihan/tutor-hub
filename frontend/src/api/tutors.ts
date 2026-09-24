import { apiClient } from './client';
import type { Tutor } from '../types';

export interface TutorFilterParams {
  city?: string;
  area?: string;
  subject?: string;
  class_level?: string;
  gender?: string;
  university?: string;
  experience_min?: number;
  salary_max?: number;
  tuition_type?: string;
  search?: string;
}

export const tutorsApi = {
  getTutors: async (params?: TutorFilterParams): Promise<{ count: number; results: Tutor[] }> => {
    const response = await apiClient.get('/tutors/', { params });
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

  getTutorById: async (tutorId: string): Promise<Tutor | null> => {
    const response = await apiClient.get(`/tutors/${tutorId}/`);
    return response.data || null;
  },

  getMyProfile: async (): Promise<Tutor | null> => {
    const response = await apiClient.get('/tutors/me/');
    return response.data || null;
  },

  updateMyProfile: async (data: Partial<Tutor>): Promise<Tutor> => {
    const response = await apiClient.patch('/tutors/me/', data);
    return response.data;
  },

  registerTutor: async (registrationData: any): Promise<Tutor> => {
    // 1. Register account
    const userRes = await apiClient.post('/auth/register/', {
      email: registrationData.email,
      password: registrationData.password,
      first_name: registrationData.first_name,
      last_name: registrationData.last_name,
      phone: registrationData.phone,
      role: 'TUTOR'
    });

    if (userRes.data?.access) {
      localStorage.setItem('tutorhub_access_token', userRes.data.access);
      localStorage.setItem('tutorhub_refresh_token', userRes.data.refresh);
      localStorage.setItem('tutorhub_user', JSON.stringify(userRes.data.user));
    }

    // 2. Update profile with detailed onboarding info
    const profileRes = await apiClient.patch('/tutors/me/', {
      gender: registrationData.gender,
      university: registrationData.university,
      department: registrationData.department,
      city: registrationData.city,
      area: registrationData.area,
      expected_salary: registrationData.expected_salary,
      experience_years: registrationData.experience_years,
      subjects: registrationData.subjects,
      classes: registrationData.classes,
      curriculums: registrationData.curriculums,
      preferred_locations: registrationData.preferred_locations,
      tutoring_types: registrationData.tutoring_types,
      bio: registrationData.bio,
      nid_or_birth_cert: registrationData.nid_number,
      profile_photo_url: registrationData.profile_photo
    });

    return profileRes.data;
  }
};
