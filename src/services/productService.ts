import supabase from '../supabaseClient';

export const getAll = async () => {
  const { data, error } = await supabase
    .from('vista_productos_con_categoria')
    .select('*');

  if (error) throw error;

  return data;
};