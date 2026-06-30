// src/components/AuditLogsTable.jsx
import React, { useEffect, useState } from 'react';
import { obtenerAuditLogs } from '../api/audit-logs';

function parseMetadata(meta) {
  if (!meta) return null;
  try {
    return typeof meta === 'string' ? JSON.parse(meta) : meta;
  } catch {
    return { raw: meta };
  }
}

export default function AuditLogsTable({ token }) {
  const [filters, setFilters] = useState({
    usuario: '',
    accion: '',
    desde: '',
    hasta: ''
  });
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState({ items: [], meta: { total: 0 } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await obtenerAuditLogs({ ...filters, limit, offset }, token);
      setData({
        items: resp.items || [],
        meta: resp.meta || { total: (resp.items || []).length }
      });
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset]);

  function onSearch(e) {
    e.preventDefault();
    setOffset(0);
    load();
  }

  return (
    <div>
      <h3>Audit Logs</h3>

      <form onSubmit={onSearch} style={{ marginBottom: 12 }}>
        <input
          placeholder="usuario"
          value={filters.usuario}
          onChange={(e) => setFilters(f => ({ ...f, usuario: e.target.value }))}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="accion"
          value={filters.accion}
          onChange={(e) => setFilters(f => ({ ...f, accion: e.target.value }))}
          style={{ marginRight: 8 }}
        />
        <input
          type="date"
          placeholder="desde"
          value={filters.desde}
          onChange={(e) => setFilters(f => ({ ...f, desde: e.target.value }))}
          style={{ marginRight: 8 }}
        />
        <input
          type="date"
          placeholder="hasta"
          value={filters.hasta}
          onChange={(e) => setFilters(f => ({ ...f, hasta: e.target.value }))}
          style={{ marginRight: 8 }}
        />
        <button type="submit">Filtrar</button>
      </form>

      {loading && <div>Cargando...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>#</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>Usuario</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>Acción</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>Tabla</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>Target ID</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>Metadata</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {data.items.length === 0 && !loading && (
            <tr><td colSpan="8" style={{ padding: 12 }}>No hay registros</td></tr>
          )}
          {data.items.map((row, i) => {
            const meta = parseMetadata(row.metadata);
            const metaSummary = meta?.after ? (
              <div>
                <strong>after:</strong> {meta.after.nombre || meta.after.id || '—'}
                <br />
                <small>{meta.before ? `before cantidad: ${meta.before.cantidad ?? '—'}` : ''}</small>
              </div>
            ) : (meta ? <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(meta)}</pre> : '—');

            return (
              <tr key={row.id || i}>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{i + 1 + offset}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{row.id}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{row.actor_username || '—'}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{row.action}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{row.target_table}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{row.target_id || '—'}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{metaSummary}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{row.created_at}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setOffset(o => Math.max(0, o - limit))} disabled={offset === 0}>Anterior</button>
        <button onClick={() => setOffset(o => o + limit)} disabled={data.items.length < limit}>Siguiente</button>
        <span style={{ marginLeft: 12 }}>
          Mostrando {offset + 1} - {Math.min(offset + data.items.length, data.meta?.total ?? offset + data.items.length)} de {data.meta?.total ?? '??'}
        </span>
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setOffset(0); }}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}
