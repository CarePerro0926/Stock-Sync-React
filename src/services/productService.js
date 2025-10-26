// src/services/productService.js
import supabase from './supabaseClient';

export const productService = {
  // Obtener productos; trae también categoria_id (UUID) y opcionalmente nombre de categoría
  getAll: async () => {
    // Si quieres el nombre de la categoría, usa join mediante RPC o consulta manual; aquí devolvemos campos base
    const { data, error } = await supabase
      .from('productos')
      .select('id,nombre,precio,cantidad,categoria_id');
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      cantidad: p.cantidad,
      categoria_id: p.categoria_id
    }));
  },

  // Crear producto y (opcional) insertar relaciones en producto_proveedor
  // producto = { id, nombre, precio, cantidad, categoria_id, proveedores: [provId,...] }
  create: async (producto) => {
    const { id, nombre, precio, cantidad, categoria_id, proveedores = [] } = producto;

    // 1) Insert producto
    const { data, error } = await supabase
      .from('productos')
      .insert([{ id, nombre, precio, cantidad, categoria_id }]);
    if (error) throw error;

    // 2) Insertar relaciones en producto_proveedor (si hubo proveedores)
    if (Array.isArray(proveedores) && proveedores.length > 0) {
      const relaciones = proveedores.map(provId => ({
        producto_id: id,
        proveedor_id: provId
      }));
      const { error: relError } = await supabase
        .from('producto_proveedor')
        .insert(relaciones)
        .onConflict(['producto_id','proveedor_id'])
        .ignore();
      if (relError) throw relError;
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