// src/services/apiClient.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { tokenService } from './tokenService';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor: añade siempre el accessToken
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// Interceptor: refresca token si expiró
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      (error.response.data as any)?.needsRefresh &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const newToken = await tokenService.refreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;