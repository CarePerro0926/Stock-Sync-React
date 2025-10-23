// src/components/Modals/ForgotPasswordModal.js
import React, { useState } from 'react';

const ForgotPasswordModal = ({ show, onClose }) => {
  const [userOrEmail, setUserOrEmail] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Instrucciones enviadas a ' + userOrEmail);
    onClose();
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Recuperar contraseña</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <input
                id="forgotUser"
                className="form-control"
                placeholder="Usuario o email"
                value={userOrEmail}
                onChange={(e) => setUserOrEmail(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button type="submit" id="btnSendForgot" className="btn btn-primary">Enviar</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;