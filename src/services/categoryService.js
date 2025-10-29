// src/services/categoryService.js
import { supabase } from '@/services/supabaseClient';

export const categoryService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('id,nombre')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  create: async (nombre) => {
    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  remove: async (id) => {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
