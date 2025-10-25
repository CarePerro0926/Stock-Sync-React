// src/services/productService.js
import { supabase } from './supabaseClient';

export const productService = {
  getAll: () => supabase.from('productos').select('*').then(r => {
    if (r.error) throw r.error;
    return r.data.map(p => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      cantidad: p.cantidad,
      categoria: p.categoria
    }));
  }),

  create: (producto) => supabase.from('productos').insert({
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    cantidad: producto.cantidad,
    categoria: producto.categoria,
    id_proveedor: producto.provider_id
  }).then(r => {
    if (r.error) throw r.error;
  }),

  update: (producto) => supabase
    .from('productos')
    .update({
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: producto.cantidad,
      categoria: producto.categoria
    })
    .eq('id', producto.id)
    .then(r => {
      if (r.error) throw r.error;
    }),

  remove: (id) => supabase.from('productos').delete().eq('id', id).then(r => {
    if (r.error) throw r.error;
  })
};