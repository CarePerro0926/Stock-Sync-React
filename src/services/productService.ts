// src/services/productService.ts
import { supabase } from '@/services/supabaseClient';

export const getAll = async () => {
  const { data, error } = await supabase
    .from('vista_productos_con_categoria')
    .select('*');

  if (error) throw error;

  return data;
};
