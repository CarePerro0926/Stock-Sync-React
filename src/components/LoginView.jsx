// src/components/LoginView.jsx
import React, { useState } from 'react';
import { supabase } from '@/services/supabaseClient';

const LoginView = ({ onLogin, onShowRegister, onShowCatalog, onShowForgot }) => {
  const [identifier, setIdentifier] = useState(''); // Puede ser correo o usuario
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let emailToUse = identifier.trim();

      // Si el identificador no es un correo, buscar por username en tabla usuarios
      if (!identifier.includes('@')) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('email')
          .eq('username', identifier.trim())
          .single();

        if (error || !data) {
          console.warn('Usuario no encontrado en tabla usuarios');
        } else {
          emailToUse = data.email;
        }
      }

      // Intentar login con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password.trim(),
      });

      if (authData?.user) {
        // Buscar perfil en tabla usuarios
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('username, role')
          .eq('id', authData.user.id)
          .single();

        const usr = {
          id: authData.user.id,
          email: authData.user.email,
          username: userData?.username || authData.user.email.split('@')[0],
          role: userData?.role || 'cliente',
        };

        onLogin(usr);
        return;
      }

      // Si falla Auth, intentar login local con tabla usuarios
      const { data: localUser, error: localError } = await supabase
        .from('usuarios')
        .select('*')
        .or(`email.eq.${identifier.trim()},username.eq.${identifier.trim()}`)
        .eq('pass', password.trim())
        .single();

      if (localError || !localUser) {
        alert('Credenciales incorrectas');
        return;
      }

      const usr = {
        id: localUser.id,
        email: localUser.email,
        username: localUser.username,
        role: localUser.role || 'cliente',
      };

      onLogin(usr);
    } catch (err) {
      console.error('Error inesperado:', err);
      alert('Error interno. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mx-auto p-4" style={{ maxWidth: '360px' }}>
      <h3 className="text-center text-login mb-3">Stock-Sync</h3>
      <form onSubmit={handleSubmit}>
        <input
          id="loginUser"
          className="form-control mb-2"
          placeholder="Correo o usuario"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <input
          id="loginPass"
          type="password"
          className="form-control mb-2"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="d-flex justify-content-center gap-2 mb-2">
          <button
            type="submit"
            id="btnLogin"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
          <button
            type="button"
            onClick={onShowRegister}
            id="btnShowRegister"
            className="btn btn-success"
          >
            Registrarse
          </button>
        </div>
      </form>
      <button
        onClick={onShowCatalog}
        id="btnShowCatalog"
        className="btn btn-outline-primary w-100 mb-2"
      >
        Ver Catálogo
      </button>
      <div className="text-end">
        <span
          id="btnForgot"
          className="pointer text-info"
          onClick={onShowForgot}
          style={{ cursor: 'pointer' }}
        >
          ¿Olvidaste tu contraseña?
        </span>
      </div>
    </div>
  );
};

export default LoginView;