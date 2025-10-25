// src/utils/migrarDatos.js
import { supabase } from '../services/supabaseClient';
import { initialProveedores, initialProductos, initialUsuarios } from '../data/initialData';

export async function migrarDatos() {
  // 1. Proveedores
  const { error: errProv } = await supabase.from('proveedores').insert(initialProveedores);
  if (errProv) return console.error('❌ Proveedores:', errProv.message);

<<<<<<< HEAD
  // 2. Productos → usa 'productos', no 'products'
=======
  // 2. Productos
>>>>>>> 58cb29c (ultima version)
  const { error: errProd } = await supabase.from('productos').insert(initialProductos);
  if (errProd) return console.error('❌ Productos:', errProd.message);

  // 3. Usuarios
  const { error: errUser } = await supabase.from('usuarios').insert(initialUsuarios);
  if (errUser) return console.error('❌ Usuarios:', errUser.message);

  console.log('✅ Migración completada');
}