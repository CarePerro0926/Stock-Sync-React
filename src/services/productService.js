// src/services/productService.js
import supabase from './supabaseClient';

export const productService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        id,
        nombre,
        precio,
        cantidad,
        categoria_id,
        categorias!inner ( nombre )
      `)
      .order('nombre', { ascending: true });

    if (error) {
      console.error("Error en productService.getAll:", error);
      throw error;
    }

    return (data || []).map(p => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      cantidad: p.cantidad,
      categoria_id: p.categoria_id,
      categoria_nombre: p.categorias?.nombre || null
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
        .onConflict(['producto_id', 'proveedor_id'])
        .ignore();
      if (relErr) throw relErr;
    }

    return true;
  },

  update: async (id, cambios) => {
    const { data, error } = await supabase
      .from('productos')
      .update(cambios)
      .eq('id', id)
      .select(); // ← devuelve el registro actualizado

    if (error) {
      console.error("Error en productService.update:", error);
      throw error;
    }

    return { data };
  },

  remove: async (id) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};