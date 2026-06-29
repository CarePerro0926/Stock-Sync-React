// AuditorPanel.jsx
import React from 'react';
import AuditLogsView from './AuditLogsView';

export default function AuditorPanel({ onLogout }) {
  return (
    <div className="auditor-panel container">
      <header className="d-flex justify-content-between align-items-center mb-3">
        <h2>Módulo Auditoría</h2>
        <div>
  
        </div>
      </header>
      <main>
        <AuditLogsView onLogout={onLogout} />
      </main>
    </div>
  );
}
