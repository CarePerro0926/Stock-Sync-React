// src/components/Admin/ProvidersTab.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';

const ProvidersTab = ({ proveedores: proveedoresProp = [], onAddProveedor, onToggleProveedor }) => {
  const [proveedores, setProveedores] = useState(proveedoresProp);

  useEffect(() => {
    setProveedores(proveedoresProp || []);
  }, [proveedoresProp]);

  const handleToggle = async (p) => {
    const currentlyDisabled = !!p.deleted_at;
    const confirmMsg = currentlyDisabled ? '¿Reactivar este proveedor?' : '¿Inhabilitar este proveedor?';
    if (!window.confirm(confirmMsg)) return;

    // Si el padre pasó onToggleProveedor, delegamos la acción
    if (typeof onToggleProveedor === 'function') {
      await onToggleProveedor(p.id, currentlyDisabled);
      // notificar al padre que hubo un cambio (si onAddProveedor existe, lo usamos como "refresh" callback)
      if (typeof onAddProveedor === 'function') onAddProveedor();
      return;
    }

    // Fallback: actualizar directamente desde aquí
    try {
      if (!currentlyDisabled) {
        await supabase.from('proveedores').update({ deleted_at: new Date().toISOString() }).eq('id', p.id);
      } else {
        await supabase.from('proveedores').update({ deleted_at: null }).eq('id', p.id);
      }
      // recargar lista localmente
      const { data } = await supabase.from('proveedores').select('*').order('nombre', { ascending: true });
      setProveedores(data || []);
      // notificar al padre para que refresque si lo necesita
      if (typeof onAddProveedor === 'function') onAddProveedor();
    } catch (err) {
      console.error(err);
      alert('Error al cambiar estado del proveedor.');
    }
  };

  return (
    <div>
      <h5>Proveedores</h5>
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
            {proveedores.map(p => (
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
            {proveedores.length === 0 && (
              <tr><td colSpan={5}>No hay proveedores</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProvidersTab;