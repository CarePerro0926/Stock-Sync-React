// src/components/LoginView.jsx
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const LoginView = ({ onLogin, onShowRegister, onShowCatalog, onShowForgot }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

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
  };

  return (
    <div className="card mx-auto p-4" style={{ maxWidth: '360px' }}>
      <h3 className="text-center text-login mb-3">Stock-Sync</h3>
      <form onSubmit={handleSubmit}>
        <input
          id="loginUser"
          className="form-control mb-2"
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          id="loginPass"
          type="password"
          className="form-control mb-2"
          placeholder="Contraseña"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <div className="d-flex justify-content-center gap-2 mb-2">
          <button type="submit" id="btnLogin" className="btn btn-primary">Iniciar Sesión</button>
          <button type="button" onClick={onShowRegister} id="btnShowRegister" className="btn btn-success">Registrarse</button>
        </div>
      </form>
      <button onClick={onShowCatalog} id="btnShowCatalog" className="btn btn-outline-primary w-100 mb-2">
        Ver Catálogo
      </button>
      <div className="text-end">
        <span id="btnForgot" className="pointer text-info" onClick={onShowForgot}>
          ¿Olvidaste tu contraseña?
        </span>
      </div>
    </div>
  );
};

export default LoginView;