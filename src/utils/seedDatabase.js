// src/utils/seedDatabase.js
import { createClient } from '@supabase/supabase-js';

// Reemplaza con tus credenciales de Supabase
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Tus datos iniciales (puedes importarlos desde initialData.js)
import { initialUsuarios, initialProductos, initialProveedores } from '../data/initialData';

export async function seedDatabase() {
  try {
    // 1. Insertar usuarios
    const { error: userError } = await supabase
      .from('usuarios')
      .insert(initialUsuarios);

    if (userError) throw new Error('Error al insertar usuarios: ' + userError.message);

    // 2. Insertar productos
    const { error: productError } = await supabase
      .from('productos')
      .insert(initialProductos);

    if (productError) throw new Error('Error al insertar productos: ' + productError.message);

    // 3. Insertar proveedores
    const { error: providerError } = await supabase
      .from('proveedores')
      .insert(initialProveedores);

    if (providerError) throw new Error('Error al insertar proveedores: ' + providerError.message);

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
  }
}