import { supabase } from '../services/supabaseClient';
import { initialUsuarios } from '../data/initialData'; // ← asegúrate que la ruta sea correcta

export const migrarUsuarios = async () => {
  for (const usuario of initialUsuarios) {
    const { error } = await supabase
      .from('usuarios')
      .insert({
        username: usuario.username, // ← debe coincidir con la columna en Supabase
        pass: usuario.pass,
        role: usuario.role,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Error usuario:', usuario.username, error);
    }
  }

  console.log('✅ Usuarios migrados');
};