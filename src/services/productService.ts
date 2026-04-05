// src/services/productService.ts
import { supabase } from '@/services/supabaseClient';

export const getAll = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      id,
      nombre,
      precio,
      cantidad,
      categoria_id,
      categoria,
      categorias ( nombre )
    `);

  if (error) throw error;

  return data;
};
