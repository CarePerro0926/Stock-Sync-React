// src/components/LoginView.jsx
import React, { useState } from 'react';

const LoginView = ({ onLogin, onShowRegister, onShowCatalog, onShowForgot }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://stock-sync-api.onrender.com/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const id = identifier.trim();
      const pwd = password.trim();

      // Construye el payload según si el identificador parece un email
      const payload = id.includes('@')
        ? { email: id, password: pwd }
        : { username: id, password: pwd };

      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result?.message || 'Credenciales incorrectas');
        return;
      }

      // ✅ Guardar tokens en localStorage
      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
      }
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }

      // Normaliza datos del usuario para la sesión
      const usr = {
        id: result.user?.id ?? null,
        email: result.user?.email ?? null,
        username: result.user?.username ?? null,
        role: result.user?.role ?? 'cliente',
        token: result.accessToken ?? null, // usa el accessToken real
      };

      // Guarda sesión en sessionStorage y eleva al estado de la app
      sessionStorage.setItem('userSession', JSON.stringify(usr));
      onLogin(usr);
    } catch (err) {
      console.error('Error inesperado en login:', err);
      alert('Error interno. Intenta de nuevo.');
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
          autoComplete="username email"
          required
        />
        <input
          id="loginPass"
          type="password"
          className="form-control mb-2"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
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
            disabled={loading}
          >
            Registrarse
          </button>
        </div>
      </form>

      <button
        onClick={onShowCatalog}
        id="btnShowCatalog"
        className="btn btn-outline-primary w-100 mb-2"
        disabled={loading}
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