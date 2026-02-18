// src/services/tokenService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const tokenService = {
  refreshToken: async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const res = await axios.post(`${API_BASE_URL}/refresh-token`, {}, {
        headers: { 'x-refresh-token': refreshToken }
      });

      const { accessToken, refreshToken: newRefreshToken } = res.data;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      return accessToken;
    } catch (err) {
      console.error('Error al refrescar token:', err);
      return null;
    }
  }
};