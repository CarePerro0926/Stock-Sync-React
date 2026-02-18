// src/services/providerService.js
import axios from 'axios';

// Obtén la URL base de tu API desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

export const providerService = {
  // Obtener proveedores
  getAll: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/proveedores`);
      return response.data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener proveedores');
    }
  },

  // Crear proveedor
  create: async (proveedor) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/proveedores`, proveedor);
      return response.data;
    } catch (error) {
      console.error('Error creating provider:', error);
      throw new Error(error.response?.data?.message || 'Error al crear proveedor');
    }
  },

  // Inhabilitar proveedor
  disable: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/proveedores/${id}/disable`);
      return response.data;
    } catch (error) {
      console.error('Error disabling provider:', error);
      throw new Error(error.response?.data?.message || 'Error al inhabilitar proveedor');
    }
  },

  // Habilitar proveedor
  enable: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/proveedores/${id}/enable`);
      return response.data;
    } catch (error) {
      console.error('Error enabling provider:', error);
      throw new Error(error.response?.data?.message || 'Error al habilitar proveedor');
    }
  }
};