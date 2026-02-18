// src/services/tokenService.js
import apiClient from './apiClient';

export const tokenService = {
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      // apiClient ya apunta a /api, así que usamos la ruta relativa '/refresh-token'
      const res = await apiClient.post('/refresh-token', null, {
        headers: { 'x-refresh-token': refreshToken }
      });

      // El backend puede devolver tokens en el body o en headers
      const newAccess = res.data?.accessToken || res.headers['x-access-token'];
      const newRefresh = res.data?.refreshToken || res.headers['x-refresh-token'];

      if (newAccess) localStorage.setItem('accessToken', newAccess);
      if (newRefresh) localStorage.setItem('refreshToken', newRefresh);

      return newAccess || null;
    } catch (err) {
      console.error('Error al refrescar token:', err);
      // Si falla, limpiar tokens locales para forzar re-login si procede
      // localStorage.removeItem('accessToken');
      // localStorage.removeItem('refreshToken');
      return null;
    }
  }
};