import axios from 'axios';

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
