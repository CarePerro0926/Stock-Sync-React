const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://TU_PROYECTO.supabase.co',
  'TU_API_KEY_SECRETA'
);

const testLoginCliente = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .or('email.eq.cliente@test.com,username.eq.cliente')
    .eq('pass', 'cliente123')
    .single();

  if (error) {
    console.error('Error al buscar usuario:', error.message);
  } else if (!data) {
    console.log(' Usuario no encontrado o contraseña incorrecta');
  } else {
    console.log(' Usuario encontrado:', data);
  }
};

testLoginCliente();