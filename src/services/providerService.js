// src/services/providerService.js
import { supabase } from './supabaseClient';

export const providerService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*');
    if (error) throw error;

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

  create: async (proveedor) => {
    const { nombre, email, telefono, categorias = [] } = proveedor;

    const { data, error } = await supabase
      .from('proveedores')
      .insert({ nombre, email, telefono })
      .select('id')
      .single();

    if (error) throw error;

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
    const { error } = await supabase
      .from('proveedores')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};