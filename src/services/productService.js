// src/services/productService.js
import supabase from './supabaseClient';

export const productService = {
  getAll: async () => {
    // Versión más segura: Consulta directa con LEFT JOIN
    const { data, error } = await supabase
      .from('productos')
      .select(`
        id,
        nombre,
        precio,
        cantidad,
        categoria_id,
        categorias:categoria_id ( nombre )
      `)
      .order('nombre', { ascending: true });

    if (error) throw error;

    // Mapear los resultados para tener 'categoria_nombre'
    return (data || []).map(p => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      cantidad: p.cantidad,
      categoria_id: p.categoria_id,
      categoria_nombre: p.categorias && p.categorias.length > 0 ? p.categorias[0].nombre : null
    }));
  },

  create: async (producto) => {
    const { id, nombre, precio, cantidad, categoria_id, proveedores = [] } = producto;
    const { error } = await supabase
      .from('productos')
      .insert([{ id, nombre, precio, cantidad, categoria_id }]);
    if (error) throw error;

    if (Array.isArray(proveedores) && proveedores.length > 0) {
      const relaciones = proveedores.map(provId => ({ producto_id: id, proveedor_id: provId }));
      const { error: relErr } = await supabase
        .from('producto_proveedor')
        .insert(relaciones)
        .onConflict(['producto_id','proveedor_id'])
        .ignore();
      if (relErr) throw relErr;
    }

    return true;
  },

  update: async (producto) => {
    const { id, nombre, precio, cantidad, categoria_id } = producto;
    const { error } = await supabase
      .from('productos')
      .update({ nombre, precio, cantidad, categoria_id })
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  remove: async (id) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};