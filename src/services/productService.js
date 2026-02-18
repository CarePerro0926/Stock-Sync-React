// src/services/productService.js
import axios from 'axios';

// URL base de la API (asegúrate que en tu .env esté con /api al final)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

// Helper para obtener headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const productService = {
  // Obtener productos
  getAll: async (includeInactivos = false) => {
    try {
      const params = includeInactivos ? '?include_inactivos=true' : '';
      const response = await axios.get(`${API_BASE_URL}/productos${params}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener productos');
    }
  },

  // Obtener producto por ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/productos/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener producto');
    }
  },

  // Crear producto
  create: async (producto) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/productos`, producto, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(error.response?.data?.message || 'Error al crear producto');
    }
  },

  // Actualizar producto
  update: async (id, producto) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/productos/${id}`, producto, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar producto');
    }
  },

  // Inhabilitar producto
  disable: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/productos/${id}/disable`, {}, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error disabling product:', error);
      throw new Error(error.response?.data?.message || 'Error al inhabilitar producto');
    }
  },

  // Habilitar producto
  enable: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/productos/${id}/enable`, {}, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error enabling product:', error);
      throw new Error(error.response?.data?.message || 'Error al habilitar producto');
    }
  },

  // Obtener movimientos de inventario
  getMovimientos: async (productId = null, type = null, limit = 100, offset = 0) => {
    try {
      let url = `${API_BASE_URL}/movimientos`;
      const params = new URLSearchParams();

      if (productId) params.append('product_id', productId);
      if (type) params.append('type', type);
      if (limit) params.append('limit', limit);
      if (offset) params.append('offset', offset);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener movimientos de inventario');
    }
  },

  // Registrar movimiento de inventario
  createMovimiento: async (movimiento) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/movimientos`, movimiento, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating inventory movement:', error);
      throw new Error(error.response?.data?.message || 'Error al registrar movimiento de inventario');
    }
  }
};