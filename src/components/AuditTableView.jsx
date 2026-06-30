// src/components/AuditTableView.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/services/supabaseClient';

export default function AuditTableView({ resource, limit = 200, offset = 0, meta = null }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Memoizar mapas para que sean estables y puedan ir en las dependencias
  const rpcMap = useMemo(() => ({
    productos: 'rpc_get_productos_for_audit',
    categorias: 'rpc_get_categorias_for_audit',
    usuarios: 'rpc_get_usuarios_for_audit'
  }), []);

  const tableMap = useMemo(() => ({
    productos: { table: 'productos', select: 'id,name,sku,price,active', orderBy: { col: 'id', asc: false } },
    categorias: { table: 'categorias', select: 'id,name,slug,active', orderBy: { col: 'id', asc: false } },
    usuarios: { table: 'vw_users_safe', select: 'id,email,username,role,nombres,apellidos,created_at,deleted_at', orderBy: { col: 'created_at', asc: false } }
  }), []);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg('');
      setRows([]);
      try {
        // Intentar RPC primero (registra en audit_access)
        const rpcName = rpcMap[resource];
        if (rpcName) {
          const { data: rpcData, error: rpcError } = await supabase.rpc(rpcName, { p_limit: limit, p_offset: offset, p_meta: meta });
          if (!rpcError && Array.isArray(rpcData)) {
            if (mounted) setRows(rpcData);
            return;
          }
          if (rpcError) console.warn(`${rpcName} RPC error, falling back to select:`, rpcError.message || rpcError);
        }

        // Fallback: select desde la vista/tabla segura
        const map = tableMap[resource];
        if (!map) {
          setErrorMsg('Recurso no soportado: ' + resource);
          return;
        }

        let query = supabase.from(map.table).select(map.select);
        if (map.orderBy) query = query.order(map.orderBy.col, { ascending: map.orderBy.asc });
        if (limit) query = query.limit(limit);
        if (offset) query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;
        if (mounted) setRows(data || []);
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

    fetchData();
    return () => { mounted = false; };
  }, [resource, limit, offset, meta, rpcMap, tableMap]); // ahora incluye rpcMap y tableMap

  return (
    <div className="card p-3 mb-3">
      <h5 className="mb-3">Ver {resource}</h5>

      {loading && <p>Cargando...</p>}

      {!loading && errorMsg && (
        <div className="alert alert-danger" role="alert">{errorMsg}</div>
      )}

      {!loading && !errorMsg && (
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                {rows.length > 0
                  ? Object.keys(rows[0]).map(k => <th key={k}>{k}</th>)
                  : <th>Sin datos</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id ?? JSON.stringify(r)}>
                  {Object.keys(r).map(k => <td key={k}>{String(r[k] ?? '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
