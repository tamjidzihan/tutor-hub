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
}

export const dashboardApi = {
    getOverview: async (): Promise<DashboardOverview> => {
        const response = await apiClient.get('/dashboard/');
        return response.data;
    },
};
