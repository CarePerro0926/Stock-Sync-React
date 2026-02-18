// src/services/productService.js
import axios from 'axios';

// Obtén la URL base de tu API desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

export const productService = {
  // Obtener productos
  getAll: async (includeInactivos = false) => {
    try {
      const params = includeInactivos ? '?include_inactivos=true' : '';
      const response = await axios.get(`${API_BASE_URL}/productos${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener productos');
    }
  },

  // Obtener producto por ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/productos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener producto');
    }
  },

  // Crear producto
  create: async (producto) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/productos`, producto);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(error.response?.data?.message || 'Error al crear producto');
    }
  },

  // Actualizar producto
  update: async (id, producto) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/productos/${id}`, producto);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar producto');
    }
  },

  // Inhabilitar producto
  disable: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/productos/${id}/disable`);
      return response.data;
    } catch (error) {
      console.error('Error disabling product:', error);
      throw new Error(error.response?.data?.message || 'Error al inhabilitar producto');
    }
  },

  // Habilitar producto
  enable: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/productos/${id}/enable`);
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
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener movimientos de inventario');
    }
  },

  // Registrar movimiento de inventario
  createMovimiento: async (movimiento) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/movimientos`, movimiento);
      return response.data;
    } catch (error) {
      console.error('Error creating inventory movement:', error);
      throw new Error(error.response?.data?.message || 'Error al registrar movimiento de inventario');
    }
  }
};