// src/services/providerService.js
import supabase from './supabaseClient';

export const providerService = {
  // Obtener proveedores y devolver también lista de categoria_ids asociados
  getAll: async () => {
    const { data, error } = await supabase
      .from('proveedores')
      .select('id,nombre,email,telefono')
      .order('nombre', { ascending: true });

    if (error) throw error;

    const proveedores = data || [];

    // Cargar categorías asociadas para cada proveedor
    const proveedoresConCategorias = await Promise.all(
      proveedores.map(async (prov) => {
        const { data: cats, error: catsErr } = await supabase
          .from('proveedor_categoria')
          .select('categoria_id')
          .eq('proveedor_id', prov.id);

        if (catsErr) throw catsErr;

        return {
          ...prov,
          categorias: (cats || []).map(c => c.categoria_id)
        };
      })
    );

    return proveedoresConCategorias;
  },

  // Crear proveedor y relaciones con categorias (categoria ids)
  // proveedor = { nombre, email, telefono, categorias: [categoriaId,...], productos: [productoId,...] }
  create: async (proveedor) => {
    const { nombre, email, telefono, categorias = [], productos = [] } = proveedor;

    // 1) Crear proveedor y obtener id
    const { data, error } = await supabase
      .from('proveedores')
      .insert([{ nombre, email, telefono }])
      .select('id')
      .single();
    if (error) throw error;
    const provId = data.id;

    // 2) Insertar relaciones proveedor_categoria
    if (Array.isArray(categorias) && categorias.length > 0) {
      const relacionesCats = categorias.map(catId => ({
        proveedor_id: provId,
        categoria_id: catId
      }));
      const { error: relCatsErr } = await supabase
        .from('proveedor_categoria')
        .insert(relacionesCats)
        .onConflict(['proveedor_id','categoria_id'])
        .ignore();
      if (relCatsErr) throw relCatsErr;
    }

    // 3) Insertar relaciones producto_proveedor (si hubo productos seleccionados)
    if (Array.isArray(productos) && productos.length > 0) {
      const relacionesProds = productos.map(prodId => ({
        producto_id: prodId,
        proveedor_id: provId
      }));
      const { error: relProdsErr } = await supabase
        .from('producto_proveedor')
        .insert(relacionesProds)
        .onConflict(['producto_id','proveedor_id'])
        .ignore();
      if (relProdsErr) throw relProdsErr;
    }

    return provId;
  },

  remove: async (id) => {
    const { error } = await supabase.from('proveedores').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};