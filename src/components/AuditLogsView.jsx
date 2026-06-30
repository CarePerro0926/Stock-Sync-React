// src/views/AuditLogsView.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';

export default function AuditLogsView({ onLogout }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ user: '', action: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Ocultar solo títulos duplicados fuera de la tarjeta; no tocar botones
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('h1, h2, .global-page-title'));
    nodes.forEach(node => {
      const text = (node.textContent || '').trim();
      if (text === 'Módulo Auditoría' && !node.closest('.audit-card')) {
        node.dataset._hiddenByAudit = '1';
        node.style.display = 'none';
      }
    });
    return () => {
      document.querySelectorAll('[data-_hiddenByAudit="1"]').forEach(el => {
        el.style.display = '';
        delete el.dataset._hiddenByAudit;
      });
    };
  }, []);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.user) params.append('usuario', filters.user);
    if (filters.action) params.append('accion', filters.action);
    if (filters.from) params.append('desde', filters.from);
    if (filters.to) params.append('hasta', filters.to);
    params.append('limit', pageSize);
    const offset = (page - 1) * pageSize;
    params.append('offset', offset);
    return params.toString();
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Obtener token si lo guardas en userSession o token
      const sessionLocal = JSON.parse(localStorage.getItem('userSession') || '{}');
      const token = sessionLocal?.token || localStorage.getItem('token') || '';
      const query = buildQuery();

      // --- Llamada al backend (ajusta la URL si usas proxy o variable de entorno) ---
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      // Si activaste validación JWT en el proxy, reenviamos el token
      if (token) headers.append('Authorization', `Bearer ${token}`);
      console.log('AuditLogs fetch -> token present?', !!token);

      const res = await fetch(`https://stock-sync-api.onrender.com/api/audit-logs?${query}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      console.log('AuditLogs fetch -> status:', res.status, 'ok:', res.ok);
      let text;
      try {
        text = await res.text();
        console.log('AuditLogs fetch -> response text:', text);
      } catch {
        console.log('AuditLogs fetch -> error reading response body');
      }

      if (!res.ok) {
        try {
          const json = JSON.parse(text || '{}');
          console.error('API audit error body:', json);
        } catch {
          console.error('API audit error raw body:', text);
        }
        setLogs([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      // parsear JSON si todo ok
      const json = JSON.parse(text || '{}');
      const items = Array.isArray(json.items) ? json.items : (Array.isArray(json) ? json : (json.items || []));
      setLogs(items);
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

  // -----------------------------
  // AÑADIDO: integración — pestañas y tablas (manteniendo tu código original intacto)
  // - Paginación por recurso: productos = 6, categorias/usuarios = 10
  // - Botones Anterior / Siguiente por recurso (misma UX que Audit Logs)
  // -----------------------------

  const [activeTab, setActiveTab] = useState('audit_logs'); // 'audit_logs' | 'productos' | 'categorias' | 'usuarios'
  const [tableRows, setTableRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState('');

  // Paginación por recurso: mantenemos página y total por cada recurso
  const [tablePage, setTablePage] = useState({
    productos: 1,
    categorias: 1,
    usuarios: 1
  });

  // Tamaño por recurso: productos = 6, otros = 10
  const tablePageSizeMap = {
    productos: 6,
    categorias: 10,
    usuarios: 10
  };

  const [tableTotal, setTableTotal] = useState({
    productos: 0,
    categorias: 0,
    usuarios: 0
  });

  const rpcMap = {
    productos: 'rpc_get_productos_for_audit',
    categorias: 'rpc_get_categorias_for_audit',
    usuarios: 'rpc_get_usuarios_for_audit'
  };

  const tableMap = {
    productos: { table: 'productos' },
    categorias: { table: 'categorias' },
    usuarios: { table: 'vw_users_safe' }
  };

  // Llamada RPC usando el cliente supabase importado
  const callRpc = async (rpcName, limit = 10, offset = 0, meta = null) => {
    setTableLoading(true);
    setTableError('');
    setTableRows([]);
    try {
      const params = { p_limit: limit, p_offset: offset, p_meta: meta };
      const { data, error } = await supabase.rpc(rpcName, params);
      if (error) {
        console.error(`${rpcName} error:`, error);
        setTableError(error.message || `Error al obtener ${rpcName}`);
        setTableRows([]);
        return;
      }
      // Normalizar: si la RPC devuelve row_to_json envuelto, extraer el objeto
      const normalized = Array.isArray(data) ? data.map(item => {
        if (item && typeof item === 'object' && Object.keys(item).length === 1) {
          const v = Object.values(item)[0];
          if (v && typeof v === 'object') return v;
        }
        return item;
      }) : [];
      setTableRows(normalized);
    } catch (err) {
      console.error('Unexpected error calling RPC', err);
      setTableError('Error inesperado al cargar datos');
      setTableRows([]);
    } finally {
      setTableLoading(false);
    }
  };

  // Obtener total de filas (intentar count exacto; si falla por RLS, usar fallback)
  const fetchTotalForResource = async (resourceName) => {
    const map = tableMap[resourceName];
    if (!map) return 0;
    try {
      const headRes = await supabase.from(map.table).select('*', { count: 'exact', head: true });
      if (headRes && typeof headRes.count === 'number') return Number(headRes.count);
    } catch (err) {
      console.warn('Count query failed (may be RLS/permissions):', err);
    }
    return 0;
  };

  useEffect(() => {
    let mounted = true;
    const fetchTableForTab = async () => {
      if (!mounted) return;
      if (activeTab === 'productos' || activeTab === 'categorias' || activeTab === 'usuarios') {
        const rpcName = rpcMap[activeTab];
        if (!rpcName) {
          setTableError('Recurso no soportado: ' + activeTab);
          return;
        }
        const currentPage = tablePage[activeTab] || 1;
        const pageSizeForTab = tablePageSizeMap[activeTab] || 10;
        const offset = (currentPage - 1) * pageSizeForTab;
        await callRpc(rpcName, pageSizeForTab, offset, null);

        // intentar obtener total y actualizar estado
        const totalCount = await fetchTotalForResource(activeTab);
        if (mounted) {
          setTableTotal(prev => ({ ...prev, [activeTab]: totalCount || (tableRows.length > 0 ? tableRows.length : prev[activeTab] || 0) }));
        }
      }
    };
    fetchTableForTab();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tablePage.productos, tablePage.categorias, tablePage.usuarios]);

  const renderTable = () => {
    if (tableLoading) return <p>Cargando...</p>;
    if (tableError) return <div className="alert alert-danger">{tableError}</div>;
    if (!tableRows || tableRows.length === 0) return <div className="text-muted">Sin datos</div>;
    const headers = Object.keys(tableRows[0]);
    const pageSizeForTab = tablePageSizeMap[activeTab] || 10;

    return (
      <div>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {tableRows.map((r, i) => (
                <tr key={r.id ?? i}>
                  {headers.map(h => <td key={h}>{String(r[h] ?? '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación para la tabla activa */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <button
              className="btn btn-primary me-2"
              onClick={() => {
                setTablePage(prev => ({ ...prev, [activeTab]: Math.max(1, (prev[activeTab] || 1) - 1) }));
              }}
              disabled={(tablePage[activeTab] || 1) <= 1}
            >
              Anterior
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                const current = tablePage[activeTab] || 1;
                const totalFor = tableTotal[activeTab] || 0;
                if (totalFor && (current * pageSizeForTab) >= totalFor) return;
                setTablePage(prev => ({ ...prev, [activeTab]: current + 1 }));
              }}
              disabled={tableTotal[activeTab] && ((tablePage[activeTab] || 1) * pageSizeForTab) >= tableTotal[activeTab]}
            >
              Siguiente
            </button>
          </div>
          <div className="text-muted">Página {tablePage[activeTab] || 1} — Total {tableTotal[activeTab] || tableRows.length}</div>
        </div>
      </div>
    );
  };

  // -----------------------------
  // FIN AÑADIDO
  // -----------------------------

  // Detectar rol desde session para mostrar pestañas solo a auditores (mantengo tu lógica de session)
  const session = JSON.parse(localStorage.getItem('userSession') || '{}');
  const roleFromSession = session?.role || '';

  return (
    <div className="audit-card card p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="audit-title mb-0">Módulo Auditoría</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-light"
            onClick={() => {
              if (activeTab === 'audit_logs') fetchLogs();
              else {
                const pageSizeForTab = tablePageSizeMap[activeTab] || 10;
                const offset = ((tablePage[activeTab] || 1) - 1) * pageSizeForTab;
                if (rpcMap[activeTab]) callRpc(rpcMap[activeTab], pageSizeForTab, offset, null);
              }
            }}
          >
            Refrescar
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (typeof onLogout === 'function') {
                onLogout();
              } else {
                localStorage.removeItem('token');
                localStorage.removeItem('userSession');
                document.cookie = 'token=; Max-Age=0; path=/;';
                window.location.href = '/login';
              }
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="mb-3 d-flex gap-2 flex-wrap">
        <input
          className="form-control"
          placeholder="Usuario"
          value={filters.user}
          onChange={event => setFilters(f => ({ ...f, user: event.target.value }))}
        />
        <input
          className="form-control"
          placeholder="Acción"
          value={filters.action}
          onChange={event => setFilters(f => ({ ...f, action: event.target.value }))}
        />
        <input
          className="form-control"
          type="date"
          value={filters.from}
          onChange={event => setFilters(f => ({ ...f, from: event.target.value }))}
        />
        <input
          className="form-control"
          type="date"
          value={filters.to}
          onChange={event => setFilters(f => ({ ...f, to: event.target.value }))}
        />
        <button
          className="btn btn-primary"
          onClick={() => { setPage(1); fetchLogs(); }}
        >
          Filtrar
        </button>
        <button
          className="btn btn-warning"
          onClick={() => { setFilters({ user: '', action: '', from: '', to: '' }); setPage(1); fetchLogs(); }}
        >
          Limpiar
        </button>
        <button className="btn btn-success" onClick={handleExportCSV}>Exportar CSV</button>
      </div>

      {/* Pestañas: Audit logs + vistas solo lectura (solo para auditores) */}
      <div className="mb-3">
        <div className="btn-group" role="group" aria-label="Audit tabs">
          <button type="button" className={`btn ${activeTab === 'audit_logs' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('audit_logs')}>Audit Logs</button>
          {roleFromSession === 'auditor' && (
            <>
              <button type="button" className={`btn ${activeTab === 'productos' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('productos')}>Productos</button>
              <button type="button" className={`btn ${activeTab === 'categorias' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('categorias')}>Categorías</button>
              <button type="button" className={`btn ${activeTab === 'usuarios' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('usuarios')}>Usuarios</button>
            </>
          )}
        </div>
      </div>

      {/* Contenido según pestaña activa */}
      {activeTab === 'audit_logs' && (
        <>
          {loading ? <p>Cargando registros...</p> : (
            <div className="audit-table-wrapper">
              <table className="table table-sm mb-0">
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
                  {logs.length === 0 && (<tr><td colSpan="7" className="text-center">No hay registros</td></tr>)}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <button className="btn btn-primary me-2" onClick={() => { if (page > 1) setPage(p => p - 1); }}>Anterior</button>
              <button className="btn btn-primary" onClick={() => { if ((page * pageSize) < total) setPage(p => p + 1); }}>Siguiente</button>
            </div>
            <div className="text-muted">Página {page} — Total {total}</div>
          </div>
        </>
      )}

      {activeTab === 'productos' && (
        <div>
          <h5 className="mb-3">Ver productos</h5>
          {renderTable()}
        </div>
      )}

      {activeTab === 'categorias' && (
        <div>
          <h5 className="mb-3">Ver categorías</h5>
          {renderTable()}
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div>
          <h5 className="mb-3">Ver usuarios</h5>
          <p className="text-muted small">Se muestran solo campos seguros; la columna <strong>pass</strong> está oculta.</p>
          {renderTable()}
        </div>
      )}
    </div>
  );
}
