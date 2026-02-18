// src/services/apiClient.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://stock-sync-api.onrender.com';

// Aseguramos que la base termine en /api (sin duplicados)
const base = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL
  : `${API_BASE_URL.replace(/\/$/, '')}/api`;

console.log('apiClient baseURL =', base); // temporal para verificar en consola

const apiClient = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: añade siempre el accessToken
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: refresca token si expiró (mantén tu lógica)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.needsRefresh &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      // tokenService debe usar apiClient o llamar a `${base}/refresh-token`
      const newToken = await import('./tokenService').then(m => m.tokenService.refreshToken());
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;