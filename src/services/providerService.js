// src/services/providerService.js
import apiClient from './apiClient';

export const providerService = {
  // Obtener proveedores
  getAll: async (includeInactivos = true) => {
    try {
      const res = await apiClient.get(`/proveedores?include_inactivos=${includeInactivos}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener proveedores');
    }
  },

  // Crear proveedor
  create: async (proveedor) => {
    try {
      const res = await apiClient.post('/proveedores', proveedor);
      return res.data;
    } catch (error) {
      console.error('Error creating provider:', error);
      throw new Error(error.response?.data?.message || 'Error al crear proveedor');
    }
  },

  // Eliminar proveedor
  remove: async (id) => {
    try {
      const res = await apiClient.delete(`/proveedores/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error deleting provider:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar proveedor');
    }
  }
};