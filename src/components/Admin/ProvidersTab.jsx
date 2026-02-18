// src/components/Admin/ProvidersTab.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { providerService } from '../../services/providerService'; // ajusta ruta si hace falta

const ProvidersTab = () => {
  const [proveedores, setProveedores] = useState([]);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [filtroTxt, setFiltroTxt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await providerService.getAll(mostrarInactivos);
        if (mounted) setProveedores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando proveedores:', err);
        if (mounted) setError('No se pudieron cargar los proveedores');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [mostrarInactivos]);

  const proveedoresFiltrados = useMemo(() => {
    let list = [...(proveedores || [])];

    if (mostrarInactivos) {
      list = list.filter(p => p.deleted_at !== null && p.deleted_at !== undefined && String(p.deleted_at).trim() !== '');
    } else {
      list = list.filter(p => p.deleted_at === null || p.deleted_at === undefined || String(p.deleted_at).trim() === '');
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

  if (loading) return <div>Cargando proveedores...</div>;
  if (error) return <div className="text-danger">{error}</div>;

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
        <div className="d-none d-md-block">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {proveedoresFiltrados.map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.email}</td>
                  <td>{p.deleted_at ? 'Inhabilitado' : 'Activo'}</td>
                </tr>
              ))}
              {proveedoresFiltrados.length === 0 && (
                <tr><td colSpan={5}>No hay proveedores</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-block d-md-none">
          <div className="row g-3 p-2">
            {proveedoresFiltrados.map((p, index) => (
              <div className="col-12" key={p.id}>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="card-title mb-1" style={{ fontSize: '0.95rem' }}>{p.nombre || '—'}</h6>
                        <div className="text-muted small">{p.email || '—'}</div>
                      </div>
                      <div className="text-end">
                        <div className="small text-muted">#</div>
                        <div className="fw-semibold">{index + 1}</div>
                        <div className="small text-muted">ID</div>
                        <div className="fw-semibold">{p.id}</div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between mt-2">
                      <div>
                        <div className="small text-muted">Estado</div>
                        <div className={`fw-semibold ${p.deleted_at ? 'text-danger' : 'text-success'}`}>
                          {p.deleted_at ? 'Inhabilitado' : 'Activo'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {proveedoresFiltrados.length === 0 && (
              <div className="col-12">
                <div className="card"><div className="card-body">No hay proveedores</div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvidersTab;