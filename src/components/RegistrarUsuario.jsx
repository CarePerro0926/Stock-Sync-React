import React from 'react';
import RegisterView from './RegisterView';

const RegistrarUsuario = () => {
  return (
    <div className="container py-4">
      <h4>Registrar nuevo usuario</h4>
      <RegisterView onShowLogin={() => window.close()} />
    </div>
  );
};

export default RegistrarUsuario;