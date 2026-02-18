// src/services/authService.js
import apiClient from './apiClient';

export const authService = {
  login: async (credentials) => {
    // apiClient ya apunta a /api, así que usamos '/login'
    const response = await apiClient.post('/login', credentials);

    const { accessToken, refreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
};