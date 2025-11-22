// src/components/Admin/ProvidersTab.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/services/supabaseClient';

const ProvidersTab = ({ proveedores: proveedoresProp = [], onAddProveedor, onToggleProveedor }) => {
  const [proveedores, setProveedores] = useState(proveedoresProp);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [filtroTxt, setFiltroTxt] = useState('');

  useEffect(() => {
    setProveedores(proveedoresProp || []);
  }, [proveedoresProp]);

  // Lista filtrada por checkbox y por texto
  const proveedoresFiltrados = useMemo(() => {
    let list = [...(proveedores || [])];

    if (!mostrarInactivos) {
      list = list.filter(p => p.deleted_at == null);
    }

    if (filtroTxt.trim()) {
      const term = filtroTxt.toLowerCase().trim();
      list = list.filter(p => {
        const idStr = String(p.id ?? '').toLowerCase();
        const nombreStr = String(p.nombre ?? '').toLowerCase();
        const emailStr = String(p.email ?? '').toLowerCase();
        return idStr.includes(term) || nombreStr.includes(term) || emailStr.includes(term);
      });
    }

    return list;
  }, [proveedores, mostrarInactivos, filtroTxt]);

  const handleToggle = async (p) => {
    const currentlyDisabled = !!p.deleted_at;
    const confirmMsg = currentlyDisabled ? '¿Reactivar este proveedor?' : '¿Inhabilitar este proveedor?';
    if (!window.confirm(confirmMsg)) return;

    if (typeof onToggleProveedor === 'function') {
      await onToggleProveedor(p.id, currentlyDisabled);
      if (typeof onAddProveedor === 'function') onAddProveedor(); // notificar/recargar si el padre lo espera
      return;
    }

    // Fallback: actualizar directamente desde aquí
    try {
      if (!currentlyDisabled) {
        await supabase.from('proveedores').update({ deleted_at: new Date().toISOString() }).eq('id', p.id);
      } else {
        await supabase.from('proveedores').update({ deleted_at: null }).eq('id', p.id);
      }
      const { data } = await supabase.from('proveedores').select('*').order('nombre', { ascending: true });
      setProveedores(data || []);
      if (typeof onAddProveedor === 'function') onAddProveedor();
    } catch (err) {
      console.error(err);
      alert('Error al cambiar estado del proveedor.');
    }
  };

  return (
    <div>
      <h5>Proveedores</h5>

      <div className="row g-2 mb-3">
        <div className="col">
          <input
            className="form-control"
            placeholder="Buscar por ID, nombre o email..."
            value={filtroTxt}
            onChange={e => setFiltroTxt(e.target.value)}
          />
        </div>

        <div className="col-auto d-flex align-items-center">
          <div className="form-check">
            <input
              id="chkMostrarInactivosProv"
              className="form-check-input"
              type="checkbox"
              checked={mostrarInactivos}
              onChange={e => setMostrarInactivos(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="chkMostrarInactivosProv">Mostrar inactivos</label>
          </div>
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.email}</td>
                <td>{p.deleted_at ? 'Inhabilitado' : 'Activo'}</td>
                <td>
                  <button
                    className={`btn btn-sm ${p.deleted_at ? 'btn-success' : 'btn-warning'}`}
                    onClick={() => handleToggle(p)}
                  >
                    {p.deleted_at ? 'Reactivar' : 'Inhabilitar'}
                  </button>
                </td>
              </tr>
            ))}
            {proveedoresFiltrados.length === 0 && (
              <tr><td colSpan={5}>No hay proveedores</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProvidersTab;