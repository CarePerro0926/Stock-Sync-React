const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://TU_PROYECTO.supabase.co',
  'TU_API_KEY_SECRETA'
);

const registerCliente = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: 'cliente@test.com',
    password: 'cliente',
  });

  if (error) {
    console.error('Error al registrar cliente:', error.message);
  } else {
    console.log(' Cliente registrado en Auth:', data);
  }
};

registerCliente();