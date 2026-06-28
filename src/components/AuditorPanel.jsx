// src/components/AuditorPanel.jsx

import React from 'react';
import AuditLogsView from './AuditLogsView';

export default function AuditorPanel({ onLogout }) {
  return (
    <div className="auditor-panel container">
      <header className="d-flex justify-content-between align-items-center mb-3">
        <h2>Módulo Auditoría</h2>
        <div>
          <button className="btn btn-secondary me-2" onClick={() => window.location.reload()}>Refrescar</button>
          <button className="btn btn-danger" onClick={onLogout}>Cerrar Sesión</button>
        </div>
      </header>
      <main>
        <AuditLogsView />
      </main>
    </div>
  );
}
