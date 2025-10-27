// src/services/productService.js
import supabase from './supabaseClient';

export const productService = {
  getAll: async () => {
    // Usar LEFT JOIN explícito para unir productos y categorias
    // Asumiendo que la FK productos.categoria_id -> categorias.id existe
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
        console.error("Error en productService.getAll:", error); // Log de error
        throw error;
    }

    // Mapear los resultados para tener 'categoria_nombre'
    // La estructura dependerá de cómo Supabase maneje el JOIN
    // Si el JOIN funciona correctamente, 'categorias' debería ser un objeto
    return (data || []).map(p => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      cantidad: p.cantidad,
      categoria_id: p.categoria_id,
      // Acceder al nombre dentro del objeto 'categorias'
      categoria_nombre: p.categorias?.nombre || null
    }));
  },

  // ... (mantén los otros métodos igual: create, update, remove)
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