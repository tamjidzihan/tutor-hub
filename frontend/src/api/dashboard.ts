import { apiClient } from './client';
import type { JobApplication, TutorRequirement } from '../types';

export interface DashboardStats {
    [key: string]: number | string | null;
}

export interface DashboardOverview {
    role: string;
    stats: DashboardStats;
    recent_applications?: JobApplication[];
    requirements?: TutorRequirement[];
    recent_tutors?: Array<{
        id: string;
        tutor_id: string;
        user__first_name: string;
        user__last_name: string;
        is_verified: boolean;
        verification_status: string;
        created_at: string;
    }>;
    analytics?: Record<string, Array<{ date: string; count: number }>>;
}

export type AdminResource = 'users' | 'tutors' | 'jobs' | 'requirements' | 'applications';
export type AdminRecord = Record<string, unknown>;

export interface AdminResourceResponse {
    resource: AdminResource;
    count: number;
    total_pages: number;
    current_page: number;
    results: AdminRecord[];
}

export const dashboardApi = {
    getOverview: async (): Promise<DashboardOverview> => {
        const response = await apiClient.get('/dashboard/');
        return response.data;
    },
    getAdminResource: async (resource: AdminResource, params?: { page?: number; page_size?: number; search?: string; role?: string; status?: string }): Promise<AdminResourceResponse> => {
        const response = await apiClient.get('/dashboard/admin/', { params: { ...params, resource } });
        return response.data;
    },
    updateAdminResource: async (resource: AdminResource, identifier: string, action: string, value?: string | boolean) => {
        const response = await apiClient.patch(`/dashboard/admin/${resource}/${identifier}/`, { action, value });
        return response.data;
    },
};
