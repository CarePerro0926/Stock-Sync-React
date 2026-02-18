// src/services/authService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const authService = {
  // Login: recibe credenciales y guarda tokens
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/api/login`, credentials);

    const { accessToken, refreshToken } = response.data;

    // Guardar tokens en localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return response.data;
  },

  // Logout: borra tokens
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // Obtener token actual
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
};