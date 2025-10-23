// src/components/Modals/PaymentModal.js
import React from 'react';

const PaymentModal = ({ show, onClose, onPayCard, onPayEfecty }) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content p-4">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title text-primary w-100 text-center">Método de Pago</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-0 pt-3 pb-4">
            <button onClick={onPayCard} id="payCard" className="btn btn-dark w-100 mb-2">Tarjeta</button>
            <button onClick={onPayEfecty} id="payEfecty" className="btn btn-success w-100">Consignación en Efecty</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;