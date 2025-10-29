// src/services/productService.js
import { supabase } from '@/services/supabaseClient';

export const productService = {
  getAll: async () => {
    // Usar la vista que ya incluye el nombre de la categoría
    const { data, error } = await supabase
      .from('vista_productos_con_categoria')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error("Error en productService.getAll:", error);
      throw error;
    }

    // Ya no necesitas mapear manualmente el nombre de la categoría
    return data || [];
  },

  create: async (producto) => {
    const { id, nombre, precio, cantidad, categoria_id, proveedores = [] } = producto;
    const { error } = await supabase
      .from('productos')
      .insert([{ id, nombre, precio, cantidad, categoria_id }]);
    if (error) throw error;

    if (Array.isArray(proveedores) && proveedores.length > 0) {
      const relaciones = proveedores.map(provId => ({
        producto_id: id,
        proveedor_id: provId
      }));
      const { error: relErr } = await supabase
        .from('producto_proveedor')
        .insert(relaciones)
        .onConflict(['producto_id', 'proveedor_id'])
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
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
