// src/components/Modals/CreditCardModal.js
import React from 'react';

const CreditCardModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content p-4">
          <div className="modal-header">
            <h5 className="modal-title">Pago con Tarjeta</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>Formulario de tarjeta aquí (simulado).</p>
            <div className="mb-3">
              <label htmlFor="cardNumber" className="form-label">Número de Tarjeta</label>
              <input type="text" className="form-control" id="cardNumber" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="row">
              <div className="col">
                <label htmlFor="cardExpiry" className="form-label">Vencimiento</label>
                <input type="text" className="form-control" id="cardExpiry" placeholder="MM/AA" />
              </div>
              <div className="col">
                <label htmlFor="cardCvv" className="form-label">CVV</label>
                <input type="text" className="form-control" id="cardCvv" placeholder="123" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-success" onClick={onConfirm}>Confirmar Pago</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardModal;