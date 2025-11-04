// src/components/LoginView.jsx
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const LoginView = ({ onLogin, onShowRegister, onShowCatalog, onShowForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      alert('Por favor ingresa correo y contraseña.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      alert('Por favor ingresa un correo electrónico válido.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        alert('Usuario/clave inválidos: ' + (error.message || 'Error desconocido'));
        return;
      }

      onLogin(); // Sin parámetros
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
          placeholder="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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