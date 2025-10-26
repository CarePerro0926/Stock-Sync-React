// src/components/LoginView.jsx
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const LoginView = ({ onLogin, onShowRegister, onShowCatalog, onShowForgot }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let emailToUse = identifier.trim();

      if (!identifier.includes('@')) {
        const {  } = await supabase
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

      const {  } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password.trim()
      });

      if (error) {
        alert('Credenciales incorrectas');
        setLoading(false);
        return;
      }

      if (session?.user) {
        const {  } = await supabase
          .from('usuarios')
          .select('username, role')
          .eq('id', session.user.id)
          .single();

        const usr = {
          id: session.user.id,
          email: session.user.email,
          username: data?.username || session.user.email.split('@')[0],
          role: data?.role || 'client'
        };

        onLogin(usr);
      }
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