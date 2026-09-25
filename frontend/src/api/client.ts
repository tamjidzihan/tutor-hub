import axios from 'axios';

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : fallback;

  const data = error.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.detail) return String(data.detail);
  if (data?.error) return String(data.error);
  if (data?.message) return String(data.message);
  if (data && typeof data === 'object') {
    const firstFieldError = Object.values(data).flat().find((value) => typeof value === 'string');
    if (firstFieldError) return String(firstFieldError);
  }

  if (error.response?.status === 401) return 'Your session has expired. Please sign in again.';
  if (error.response?.status === 403) return 'You do not have permission to perform this action.';
  if (error.response?.status === 404) return 'The requested information could not be found.';
  if (error.response?.status && error.response.status >= 500) return 'The server is unavailable right now. Please try again shortly.';
  if (error.code === 'ECONNABORTED') return 'The request took too long. Please check your connection and try again.';
  if (!error.response) return 'Unable to connect to TutorHub. Please check your connection.';
  return fallback;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tutorhub_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Auto-refresh token if 401 and refresh token exists
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('tutorhub_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: refreshToken });
          if (res.data?.access) {
            localStorage.setItem('tutorhub_access_token', res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return apiClient(originalRequest);
          }
        } catch {
          localStorage.removeItem('tutorhub_access_token');
          localStorage.removeItem('tutorhub_refresh_token');
          localStorage.removeItem('tutorhub_user');
        }
      }
    }
    return Promise.reject(error);
  }
);
