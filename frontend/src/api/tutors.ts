import { apiClient } from './client';
import type { Tutor } from '../types';

const normalizeTutorDetail = (value: Record<string, unknown>): Tutor => ({
  ...value,
  id: String(value.id || ''),
  tutor_id: String(value.tutor_id || ''),
  name: String(value.name || ''),
  profile_photo: typeof value.profile_photo === 'string' ? value.profile_photo : '',
  gender: value.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
  bio: String(value.bio || ''),
  present_address: String(value.present_address || ''),
  city: String(value.city || ''),
  area: String(value.area || ''),
  education_level: String(value.education_level || value.degree_title || ''),
  university: String(value.university || ''),
  department: String(value.department || ''),
  graduation_year: Number(value.graduation_year || value.passing_year || 0),
  experience_years: Number(value.experience_years || 0),
  expected_salary: Number(value.expected_salary || 0),
  is_verified: Boolean(value.is_verified),
  is_available: Boolean(value.is_available),
  profile_completion: Number(value.profile_completion || value.profile_completion_score || 0),
  rating: Number(value.rating || 0),
  total_reviews: Number(value.total_reviews || 0),
  subjects: Array.isArray(value.subjects) ? value.subjects.map(String) : [],
  preferred_classes: Array.isArray(value.preferred_classes) ? value.preferred_classes.map(String) : Array.isArray(value.classes) ? value.classes.map(String) : [],
  preferred_locations: Array.isArray(value.preferred_locations) ? value.preferred_locations.map(String) : [],
  preferred_tuition_type: Array.isArray(value.preferred_tuition_type) ? value.preferred_tuition_type : Array.isArray(value.tutoring_types) ? value.tutoring_types : [],
  education: Array.isArray(value.education) ? value.education : Array.isArray(value.education_records) ? value.education_records : [],
  experience: Array.isArray(value.experience) ? value.experience : Array.isArray(value.experience_records) ? value.experience_records.map((record) => ({
    id: record.id,
    organization: record.institution_or_platform,
    position: record.title,
    description: record.description,
    start_date: record.duration,
  })) : [],
  member_since: String(value.member_since || value.created_at || ''),
});

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

export interface TutorListResponse {
  count: number;
  total_pages: number;
  current_page: number;
  results: Tutor[];
}

export const tutorsApi = {
  getTutors: async (params?: TutorFilterParams, page = 1, pageSize = 6): Promise<TutorListResponse> => {
    const requestParams = { ...params, page, page_size: pageSize };
    if (requestParams.gender === 'Any') delete requestParams.gender;
    const response = await apiClient.get('/tutors/', { params: requestParams });
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

  getTutorById: async (tutorId: string): Promise<Tutor | null> => {
    const response = await apiClient.get(`/tutors/${tutorId}/`);
    return response.data ? normalizeTutorDetail(response.data) : null;
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
