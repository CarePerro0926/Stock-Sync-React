// src/components/Modals/ForgotPasswordModal.js
import React, { useState } from 'react';
import { supabase } from '@/services/supabaseClient';

const ForgotPasswordModal = ({ show, onClose }) => {
  const [userOrEmail, setUserOrEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const input = userOrEmail.trim();
    let emailToUse = null;

    try {
      // Si es correo, lo usamos directamente
      if (input.includes('@')) {
        emailToUse = input;
      } else {
        // Buscar correo por nickname en Supabase Auth
        const { data: users, error } = await supabase
          .from('users')
          .select('email, user_metadata')
          .eq('user_metadata->>nickname', input);

        if (error || !users || users.length === 0) {
          alert('No se encontró ningún usuario con ese nombre');
          return;
        }

        emailToUse = users[0].email;
      }

      // Enviar correo de recuperación
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailToUse, {
        redirectTo: 'https://stocksync.com/reset-password' // ← actualiza con tu URL real
      });

      if (resetError) {
        alert(`Error al enviar el correo: ${resetError.message}`);
        return;
      }

      alert('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
      onClose();
    } catch (err) {
      console.error('Error inesperado:', err);
      alert('Error interno. Revisa la consola.');
    } finally {
      setLoading(false);
    }
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
                required
              />
            </div>
            <div className="modal-footer">
              <button type="submit" id="btnSendForgot" className="btn btn-primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;