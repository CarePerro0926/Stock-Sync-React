// src/components/AuditLogsView.jsx
import React, { useEffect, useState } from 'react';

export default function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ user: '', action: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);
  const [total, setTotal] = useState(0);

  // --- Ocultar título y botones duplicados fuera del recuadro ---
  useEffect(() => {
    // Oculta elementos con texto exacto que NO estén dentro de .audit-card
    const hideOutsideCard = (selector, exactText) => {
      const nodes = Array.from(document.querySelectorAll(selector));
      nodes.forEach(node => {
        const text = (node.textContent || '').trim();
        if (text === exactText) {
          if (!node.closest('.audit-card')) {
            node.dataset._hiddenByAudit = '1';
            node.style.display = 'none';
          }
        }
      });
    };

    // Ajusta los textos si tu header usa variantes distintas
    hideOutsideCard('h1, h2, .global-page-title', 'Módulo Auditoría');
    hideOutsideCard('button', 'Refrescar');
    hideOutsideCard('button', 'Cerrar Sesión');

    // Restaurar al desmontar
    return () => {
      document.querySelectorAll('[data-_hiddenByAudit="1"]').forEach(el => {
        el.style.display = '';
        delete el.dataset._hiddenByAudit;
      });
    };
  }, []);
  // --- fin ocultar duplicados ---

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.user) params.append('usuario', filters.user); // coincide con backend
    if (filters.action) params.append('accion', filters.action);
    if (filters.from) params.append('desde', filters.from);
    if (filters.to) params.append('hasta', filters.to);
    params.append('limit', pageSize);
    // calcular offset si el backend usa offset
    const offset = (page - 1) * pageSize;
    params.append('offset', offset);
    return params.toString();
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Ajusta según dónde guardes el token:
      // Si guardas en localStorage.userSession: const session = JSON.parse(localStorage.getItem('userSession') || '{}'); const token = session?.token || '';
      const session = JSON.parse(localStorage.getItem('userSession') || '{}');
      const token = session?.token || localStorage.getItem('token') || '';

      const query = buildQuery();

      // Asegúrate que la ruta coincide con tu backend: /api/audit-logs
      const base = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${base}/api/audit-logs?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });

      if (!res.ok) {
        console.error('API audit error', res.status);
        setLogs([]);
        setTotal(0);
        return;
      }

      const json = await res.json();

      // Manejar ambos formatos: { items, meta } o array directo
      const items = Array.isArray(json.items) ? json.items : (Array.isArray(json) ? json : (json.items || []));
      setLogs(items);

      // Si el backend devuelve meta.total, úsalo para paginación
      const metaTotal = json.meta?.total ?? (Array.isArray(json) ? json.length : items.length);
      setTotal(Number(metaTotal) || 0);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleExportCSV = () => {
    if (!logs || logs.length === 0) {
      alert('No hay registros para exportar');
      return;
    }
    const rows = logs.map(l => ({
      id: l.id,
      actor_username: l.actor_username,
      action: l.action,
      target_table: l.target_table,
      target_id: l.target_id,
      created_at: l.created_at,
      ip: l.ip,
      reason: l.reason,
      metadata: JSON.stringify(l.metadata || '')
    }));
    const csvContent = [
      Object.keys(rows[0]).join(','),
      ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_export_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // UI: contenedor tipo "card" con título visible
  return (
    <div className="audit-card card p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="audit-title mb-0">Módulo Auditoría</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-light" onClick={() => fetchLogs()}>Refrescar</button>
          <button className="btn btn-outline-secondary" onClick={() => { /* logout si aplica */ }}>Cerrar Sesión</button>
        </div>
      </div>

      <div className="mb-3 d-flex gap-2 flex-wrap">
        <input className="form-control" placeholder="Usuario" value={filters.user} onChange={e => setFilters(f => ({ ...f, user: e.target.value }))} />
        <input className="form-control" placeholder="Acción" value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))} />
        <input className="form-control" type="date" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
        <input className="form-control" type="date" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
        <button className="btn btn-primary" onClick={() => { setPage(1); fetchLogs(); }}>Filtrar</button>
        <button className="btn btn-outline-secondary" onClick={() => { setFilters({ user: '', action: '', from: '', to: '' }); setPage(1); fetchLogs(); }}>Limpiar</button>
        <button className="btn btn-success" onClick={handleExportCSV}>Exportar CSV</button>
      </div>

      {loading ? <p>Cargando registros...</p> : (
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Tabla</th>
                <th>ID</th>
                <th>Fecha</th>
                <th>IP</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td>{l.actor_username}</td>
                  <td>{l.action}</td>
                  <td>{l.target_table}</td>
                  <td>{l.target_id}</td>
                  <td>{l.created_at ? new Date(l.created_at).toLocaleString() : ''}</td>
                  <td>{l.ip}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => {
                      const detail = l.metadata ? JSON.stringify(l.metadata, null, 2) : JSON.stringify(l, null, 2);
                      const w = window.open('', '_blank', 'noopener,noreferrer');
                      w.document.write(`<pre>${detail.replace(/</g, '&lt;')}</pre>`);
                      w.document.title = `Audit ${l.id}`;
                    }}>Ver</button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="7" className="text-center">No hay registros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => { if (page > 1) setPage(p => p - 1); }}>Anterior</button>
          <button className="btn btn-outline-secondary" onClick={() => { if ((page * pageSize) < total) setPage(p => p + 1); }}>Siguiente</button>
        </div>
        <div className="text-muted">Página {page} — Total {total}</div>
      </div>
    </div>
  );
}
