// src/components/AuditTableView.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/services/supabaseClient';

export default function AuditTableView({
  resource,
  initialPage = 1,
  pageSize = 10,
  meta = null
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);

  // RPCs preferidas (registran en audit_access). Fallback a tablas/vistas seguras.
  const rpcMap = useMemo(() => ({
    productos: 'rpc_get_productos_for_audit',
    categorias: 'rpc_get_categorias_for_audit',
    usuarios: 'rpc_get_usuarios_for_audit'
  }), []);

  const tableMap = useMemo(() => ({
    productos: { table: 'productos' },
    categorias: { table: 'categorias' },
    usuarios: { table: 'vw_users_safe' }
  }), []);

  useEffect(() => {
    let mounted = true;
    const fetchPage = async () => {
      setLoading(true);
      setErrorMsg('');
      setRows([]);
      try {
        const rpcName = rpcMap[resource];
        const offset = (page - 1) * pageSize;

        // Intentar RPC primero (registra en audit_access)
        if (rpcName) {
          const { data: rpcData, error: rpcError } = await supabase.rpc(rpcName, {
            p_limit: pageSize,
            p_offset: offset,
            p_meta: meta
          });
          if (!rpcError && Array.isArray(rpcData)) {
            // Normalizar row_to_json / to_jsonb envoltorios
            const normalized = rpcData.map(item => {
              if (item && typeof item === 'object' && Object.keys(item).length === 1) {
                const v = Object.values(item)[0];
                if (v && typeof v === 'object') return v;
              }
              return item;
            });
            if (mounted) setRows(normalized);
          } else {
            // Si RPC falla, hacemos fallback a select
            if (rpcError) console.warn(`${rpcName} RPC error, falling back to select:`, rpcError.message || rpcError);
            await fetchFallback(offset);
          }
        } else {
          await fetchFallback(offset);
        }

        // Intentar obtener total con count exacto (si permisos lo permiten)
        const map = tableMap[resource];
        if (map && map.table) {
          try {
            const headRes = await supabase.from(map.table).select('*', { count: 'exact', head: true });
            // headRes.count puede ser null si no se soporta; en ese caso lo ignoramos
            if (mounted && typeof headRes.count === 'number') {
              setTotal(Number(headRes.count));
            } else {
              // si no hay count, usar filas actuales como aproximación
              if (mounted) setTotal(prev => (rows.length > 0 ? rows.length : prev));
            }
          } catch (countErr) {
            // No romper si falla el count por RLS/permisos
            console.warn('Count query failed (may be RLS/permissions):', countErr);
            if (mounted) setTotal(prev => (rows.length > 0 ? rows.length : prev));
          }
        } else {
          if (mounted) setTotal(prev => (rows.length > 0 ? rows.length : prev));
        }
      } catch (err) {
        console.error('Error fetching audit table', err);
        if (mounted) {
          setErrorMsg(err.message || 'Error al obtener datos');
          setRows([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Fallback select si RPC no está disponible o falla
    const fetchFallback = async (offset) => {
      const map = tableMap[resource];
      if (!map) {
        if (mounted) setErrorMsg('Recurso no soportado: ' + resource);
        return;
      }
      let query = supabase.from(map.table).select('*');
      if (pageSize) query = query.limit(pageSize);
      if (offset) query = query.range(offset, offset + pageSize - 1);
      const { data, error } = await query;
      if (error) throw error;
      if (mounted) setRows(data || []);
    };

    fetchPage();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, page, pageSize, meta, rpcMap, tableMap]);

  // Manejo de paginación
  const handlePrev = () => {
    if (page > 1) setPage(p => p - 1);
  };
  const handleNext = () => {
    // Si total conocido, evitar pasar más allá
    if (total && (page * pageSize) >= total) return;
    setPage(p => p + 1);
  };

  // Construir encabezados dinámicos a partir de todas las claves presentes
  const headers = Array.from(rows.reduce((acc, r) => {
    Object.keys(r || {}).forEach(k => acc.add(k));
    return acc;
  }, new Set()));

  return (
    <div className="card p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Ver {resource}</h5>
        <div className="text-muted small">Página {page} — Total {total || rows.length}</div>
      </div>

      {loading && <p>Cargando...</p>}

      {!loading && errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}

      {!loading && !errorMsg && (
        <>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  {headers.length > 0 ? headers.map(h => <th key={h}>{h}</th>) : <th>Sin datos</th>}
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? rows.map((r, i) => (
                  <tr key={r.id ?? i}>
                    {headers.map(h => <td key={h}>{String((r && r[h]) ?? '')}</td>)}
                  </tr>
                )) : (
                  <tr><td colSpan={headers.length || 1} className="text-center text-muted">Sin datos</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <button className="btn btn-primary me-2" onClick={handlePrev} disabled={page <= 1}>Anterior</button>
              <button className="btn btn-primary" onClick={handleNext} disabled={total && (page * pageSize) >= total}>Siguiente</button>
            </div>
            <div className="text-muted small">Mostrando {rows.length} registros</div>
          </div>
        </>
      )}
    </div>
  );
}
