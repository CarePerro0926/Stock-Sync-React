// src/components/LoginView.js
import React, { useState } from 'react';

const LoginView = ({ onLogin, onShowRegister, onShowCatalog, onShowForgot }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(user, pass);
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