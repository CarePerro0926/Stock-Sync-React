// src/services/providerService.js
import { supabase } from './supabaseClient';

export const providerService = {
  getAll: () => supabase.from('proveedores').select('*').then(r => {
    if (r.error) throw r.error;
    return r.data;
  }),

  create: (proveedor) => supabase.from('proveedores').insert({
    nombre: proveedor.nombre,
    email: proveedor.email,
    telefono: proveedor.phone || ''
  }).then(r => {
    if (r.error) throw r.error;
  }),

  remove: (id) => supabase.from('proveedores').delete().eq('id', id).then(r => {
    if (r.error) throw r.error;
  })
};