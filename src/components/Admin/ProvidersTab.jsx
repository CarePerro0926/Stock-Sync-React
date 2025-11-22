// src/components/Admin/ProvidersTab.jsx
import React, { useEffect, useState, useMemo } from 'react';

const ProvidersTab = ({ proveedores: proveedoresProp = [] }) => {
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

      {/* Vista en tabla para pantallas medianas y grandes */}
      <div className="d-none d-md-block" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.email}</td>
                <td>{p.deleted_at ? 'Inhabilitado' : 'Activo'}</td>
              </tr>
            ))}
            {proveedoresFiltrados.length === 0 && (
              <tr><td colSpan={4}>No hay proveedores</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vista en tarjetas para pantallas pequeñas */}
      <div className="d-block d-md-none">
        <div className="row row-cols-1 g-3">
          {proveedoresFiltrados.map(p => (
            <div className="col" key={p.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title text-primary">{p.nombre}</h6>
                  <p className="card-text mb-1"><strong>ID:</strong> {p.id}</p>
                  <p className="card-text mb-1"><strong>Email:</strong> {p.email}</p>
                  <p className="card-text"><strong>Estado:</strong> {p.deleted_at ? 'Inhabilitado' : 'Activo'}</p>
                </div>
              </div>
            </div>
          ))}
          {proveedoresFiltrados.length === 0 && (
            <div className="col">
              <div className="card"><div className="card-body">No hay proveedores</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProvidersTab;