// src/hooks/useAuth.js
import { supabase } from '@/services/supabaseClient';

export const useAuth = () => {
  const validarUsuario = async (user, pass) => {
    const u = user.trim().toLowerCase();
    const p = pass.trim();

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', u)
      .eq('pass', p);

    if (error) {
      console.error('Error al consultar usuario:', error);
      return null;
    }

    return data?.[0] || null;
  };

  const registrarUsuario = async (nuevoUsuario) => {
    const { error } = await supabase.from('usuarios').insert({
      username: nuevoUsuario.user,
      pass: nuevoUsuario.pass,
      role: nuevoUsuario.role
    });

    if (error) {
      console.error('❌ Error al registrar usuario:', error);
      return false;
    }
    return true;
  };

  return {
    validarUsuario,
    registrarUsuario
  };
};
