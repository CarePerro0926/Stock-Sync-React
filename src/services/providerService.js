// src/services/providerService.js
import { supabase } from './supabaseClient';

export const providerService = {
  // Obtener proveedores + sus categorías
  getAll: async () => {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*');
    if (error) throw error;

    // Para cada proveedor, cargar sus categorías
    const proveedoresConCategorias = await Promise.all(
      data.map(async (prov) => {
        const { data: cats } = await supabase
          .from('proveedor_categorias')
          .select('categoria_id')
          .eq('proveedor_id', prov.id);
        
        return {
          ...prov,
          categorias: cats ? cats.map(c => c.categoria_id) : []
        };
      })
    );
    return proveedoresConCategorias;
  },

  // Crear proveedor + sus categorías
  create: async (proveedor) => {
    const { nombre, email, telefono, categorias = [] } = proveedor;

    // 1. Crear el proveedor
    const { data, error } = await supabase
      .from('proveedores')
      .insert({ nombre, email, telefono })
      .select('id')
      .single();

    if (error) throw error;

    // 2. Crear relaciones en proveedor_categorias
    if (categorias.length > 0) {
      const relaciones = categorias.map(catId => ({
        proveedor_id: data.id,
        categoria_id: catId
      }));

      const { error: relError } = await supabase
        .from('proveedor_categorias')
        .insert(relaciones);

      if (relError) throw relError;
    }
  },

  remove: async (id) => {
    // Al eliminar proveedor, las relaciones se borran por CASCADE
    const { error } = await supabase
      .from('proveedores')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};