// src/components/LoginView.jsx
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const LoginView = ({ onLogin, onShowRegister, onShowCatalog, onShowForgot }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  // ✅ Lógica de validación movida aquí
  const validarUsuario = async (username, password) => {
    const u = username.trim().toLowerCase();
    const p = password.trim();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usr = await validarUsuario(user, pass);
    onLogin(usr); // Envía el resultado a App.jsx
=======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let emailToUse = identifier.trim();

      // Si el identificador no es un correo, buscar por username
      if (!identifier.includes('@')) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('email')
          .eq('username', identifier.trim())
          .single();

        if (error || !data) {
          alert('Usuario no encontrado');
          setLoading(false);
          return;
        }
        emailToUse = data.email;
      }

      // Intentar iniciar sesión con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password.trim(),
      });

      if (authError) {
        alert('Credenciales incorrectas');
        setLoading(false);
        return;
      }

      // Obtener datos adicionales del usuario desde tu tabla 'usuarios'
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('username, role')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('Error al cargar perfil:', userError);
        alert('No se pudo cargar tu perfil. Contacta al administrador.');
        setLoading(false);
        return;
      }

      const usr = {
        id: authData.user.id,
        email: authData.user.email,
        username: userData?.username || authData.user.email.split('@')[0],
        role: userData?.role || 'cliente', // usa 'cliente' como fallback
      };

      onLogin(usr);
    } catch (err) {
      console.error('Error inesperado:', err);
      alert('Error interno. Revisa la consola.');
    } finally {
      setLoading(false);
    }
>>>>>>> 3ca678d89a8bf5a3c6912987482849848afec5dd
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