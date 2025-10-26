// src/services/categoryService.js
import { supabase } from './supabaseClient';

export const categoryService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data; // [{ id: 'uuid', nombre: '...' }]
  },

  create: async (nombre) => {
    const { error } = await supabase
      .from('categorias')
      .insert({ nombre });
    if (error) throw error;
  },

  remove: async (id) => {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};