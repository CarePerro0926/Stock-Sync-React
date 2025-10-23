// src/components/Modals/ConfirmationModal.js
import React from 'react';

const ConfirmationModal = ({ show, onClose, title, body }) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content p-4">
          <div className="modal-header border-0 pb-0">
            <h5 id="confirmTitle" className="modal-title text-primary w-100 text-center">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div id="confirmBody" className="modal-body px-0 pt-3 pb-4" dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;