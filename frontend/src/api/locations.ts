import { apiClient } from './client';

export interface LocationArea {
  id: number;
  name: string;
  slug: string;
}

export interface LocationCity {
  id: number;
  name: string;
  slug: string;
  areas: LocationArea[];
}

export const locationsApi = {
  getCities: async (): Promise<LocationCity[]> => {
    const response = await apiClient.get('/locations/');
    if (response.data?.results) return response.data.results;
    if (Array.isArray(response.data)) return response.data;
    return [];
  },

  getAreasByCity: async (citySlug: string): Promise<LocationArea[]> => {
    const response = await apiClient.get(`/locations/${citySlug}/areas/`);
    if (response.data?.results) return response.data.results;
    if (Array.isArray(response.data)) return response.data;
    return [];
  }
};
