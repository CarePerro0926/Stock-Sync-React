// src/services/providerService.js
import axios from 'axios';

// Configuración CORRECTA de la URL base
// NOTA: VITE_API_URL NO debe terminar con "/api"
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

/**
 * Obtiene los headers de autenticación
 * Usa el token de sesión del usuario actual
 */
const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  
  try {
    const session = JSON.parse(sessionStorage.getItem('userSession') || '{}');
    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }
  } catch (err) {
    console.warn('providerService: error al leer userSession', err);
  }
  
  return headers;
};

export const providerService = {
  // Obtener proveedores
  getAll: async (includeInactivos = false) => {
    try {
      // ¡CORREGIDO! Ahora usa /api/proveedores
      const params = includeInactivos ? '?include_inactivos=true' : '';
      const response = await axios.get(
        `${API_BASE_URL}/api/proveedores${params}`,
        { headers: getAuthHeaders() } // ¡AGREGADO! Headers de autenticación
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener proveedores');
    }
  },

  // Obtener proveedor por ID
  getById: async (id) => {
    try {
      // ¡CORREGIDO! Ahora usa /api/proveedores
      const response = await axios.get(
        `${API_BASE_URL}/api/proveedores/${id}`,
        { headers: getAuthHeaders() } // ¡AGREGADO! Headers de autenticación
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching provider:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener proveedor');
    }
  },

  // Crear proveedor
  create: async (proveedor) => {
    try {
      // ¡CORREGIDO! Ahora usa /api/proveedores
      const response = await axios.post(
        `${API_BASE_URL}/api/proveedores`,
        proveedor,
        { headers: getAuthHeaders() } // ¡AGREGADO! Headers de autenticación
      );
      return response.data;
    } catch (error) {
      console.error('Error creating provider:', error);
      throw new Error(error.response?.data?.message || 'Error al crear proveedor');
    }
  },

  // Actualizar proveedor
  update: async (id, proveedor) => {
    try {
      // ¡CORREGIDO! Ahora usa /api/proveedores
      const response = await axios.put(
        `${API_BASE_URL}/api/proveedores/${id}`,
        proveedor,
        { headers: getAuthHeaders() } // ¡AGREGADO! Headers de autenticación
      );
      return response.data;
    } catch (error) {
      console.error('Error updating provider:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar proveedor');
    }
  },

  // Inhabilitar proveedor
  disable: async (id) => {
    try {
      // ¡CORREGIDO! Ahora usa /api/proveedores
      const response = await axios.patch(
        `${API_BASE_URL}/api/proveedores/${id}/disable`,
        { reason: 'inhabilitado admin' }, // Datos del body
        { headers: getAuthHeaders() } // ¡AGREGADO! Headers de autenticación
      );
      return response.data;
    } catch (error) {
      console.error('Error disabling provider:', error);
      throw new Error(error.response?.data?.message || 'Error al inhabilitar proveedor');
    }
  },

  // Habilitar proveedor
  enable: async (id) => {
    try {
      // ¡CORREGIDO! Ahora usa /api/proveedores
      const response = await axios.patch(
        `${API_BASE_URL}/api/proveedores/${id}/enable`,
        { reason: 'reactivado admin' }, // Datos del body
        { headers: getAuthHeaders() } // ¡AGREGADO! Headers de autenticación
      );
      return response.data;
    } catch (error) {
      console.error('Error enabling provider:', error);
      throw new Error(error.response?.data?.message || 'Error al habilitar proveedor');
    }
  }
};