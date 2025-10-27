export const getAll = async () => {
  const { data, error } = await supabase
    .from('vista_productos_con_categoria')
    .select('*');

  if (error) throw error;

  console.log(data); // 👈 Verifica qué campos llegan
  return data;
};