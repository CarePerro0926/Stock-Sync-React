// src/services/categoryService.js
import { supabase } from './supabaseClient';

export const categoryService = {
  getAll: () => supabase.from('categorias').select('*').then(r => {
    if (r.error) throw r.error;
    return r.data;
  }),

  create: (nombre) => supabase.from('categorias').insert({ nombre }).then(r => {
    if (r.error) throw r.error;
  }),

  remove: (id) => supabase.from('categorias').delete().eq('id', id).then(r => {
    if (r.error) throw r.error;
  })
};