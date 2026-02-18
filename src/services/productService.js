// src/services/productService.js
import apiClient from './apiClient';

export const productService = {
  getAll: async (includeInactivos = false) => {
    const params = includeInactivos ? '?include_inactivos=true' : '';
    const res = await apiClient.get(`/productos${params}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/productos/${id}`);
    return res.data;
  },

  create: async (producto) => {
    const res = await apiClient.post('/productos', producto);
    return res.data;
  },

  update: async (id, producto) => {
    const res = await apiClient.put(`/productos/${id}`, producto);
    return res.data;
  },

  disable: async (id) => {
    const res = await apiClient.patch(`/productos/${id}/disable`);
    return res.data;
  },

  enable: async (id) => {
    const res = await apiClient.patch(`/productos/${id}/enable`);
    return res.data;
  },

  getMovimientos: async (productId = null, type = null, limit = 100, offset = 0) => {
    const params = new URLSearchParams();
    if (productId) params.append('product_id', productId);
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);

    const url = params.toString() ? `/movimientos?${params.toString()}` : '/movimientos';
    const res = await apiClient.get(url);
    return res.data;
  },

  createMovimiento: async (movimiento) => {
    const res = await apiClient.post('/movimientos', movimiento);
    return res.data;
  }
};