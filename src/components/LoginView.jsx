// src/components/LoginView.jsx
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const LoginView = ({ onLogin, onShowRegister, onShowCatalog, onShowForgot }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    let emailToUse = identifier.trim();

    // Si no es un email, busca el email por username
    if (!identifier.includes('@')) {
      const {  } = await supabase
        .from('usuarios')
        .select('email')
        .eq('username', identifier.trim())
        .single();

      if (error) {
        console.error('Error al buscar usuario:', error);
        alert('Usuario no encontrado');
        return;
      }

      if (!data) {
        alert('Usuario no encontrado');
        return;
      }

      emailToUse = data.email;
    }

    // Iniciar sesión con Supabase Auth
    const {  } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password.trim()
    });

    if (error) {
      console.error('Error de login:', error.message);
      alert('Credenciales incorrectas');
      return;
    }

    if (session?.user) {
      // Obtener perfil desde tu tabla 'usuarios'
      const {  } = await supabase
        .from('usuarios')
        .select('username, role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error al cargar perfil:', error);
      }

      const usr = {
        id: session.user.id,
        email: session.user.email,
        username: data?.username || session.user.email.split('@')[0],
        role: data?.role || 'client'
      };

      onLogin(usr);
    }
  };

  return (
    <div className="card mx-auto p-4" style={{ maxWidth: '360px' }}>
      <h3 className="text-center text-login mb-3">Stock-Sync</h3>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          placeholder="Correo o usuario"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-2"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="d-flex justify-content-center gap-2 mb-2">
          <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
          <button type="button" onClick={onShowRegister} className="btn btn-success">Registrarse</button>
        </div>
      </form>
      <button onClick={onShowCatalog} className="btn btn-outline-primary w-100 mb-2">
        Ver Catálogo
      </button>
      <div className="text-end">
        <span className="pointer text-info" onClick={onShowForgot}>
          ¿Olvidaste tu contraseña?
        </span>
      </div>
    </div>
  );
};

export default LoginView;