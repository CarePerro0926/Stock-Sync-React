// src/services/providerService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

// Helper para añadir el token en cada petición
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const providerService = {
  // Obtener proveedores
  getAll: async (includeInactivos = true) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/proveedores?include_inactivos=${includeInactivos}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener proveedores');
    }
  },

  // Crear proveedor
  create: async (proveedor) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/proveedores`, proveedor, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating provider:', error);
      throw new Error(error.response?.data?.message || 'Error al crear proveedor');
    }
  },

  // Eliminar proveedor
  remove: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/proveedores/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting provider:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar proveedor');
    }
  }
};