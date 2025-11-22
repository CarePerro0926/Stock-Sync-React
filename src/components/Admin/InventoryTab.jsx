// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo, useEffect } from 'react';

const InventoryTab = ({ productos = [], categorias = [] }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');

  useEffect(() => {
    console.log('--- DATOS EN INVENTORYTAB ---');
    console.log('Productos recibidos:', productos);
    console.log('Categorías recibidas:', categorias);
  }, [productos, categorias]);

  const listaCategoriasFiltro = useMemo(() => {
    const nombresDesdeProductos = (productos || [])
      .map(p => p.categoria_nombre)
      .filter(nombre => nombre && String(nombre).trim() !== '');
    const unicas = [...new Set(nombresDesdeProductos.map(nombre => String(nombre).trim()))];
    return ['Todas', ...unicas];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    let filtered = [...(productos || [])];

    if (filtroCat !== 'Todas') {
      const filtroCatStr = String(filtroCat).trim();
      filtered = filtered.filter(p => {
        const nombreCategoria = p.categoria_nombre;
        return nombreCategoria && String(nombreCategoria).trim() === filtroCatStr;
      });
    }

    if (filtroTxt.trim()) {
      const term = filtroTxt.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const idStr = String(p.id ?? '');
        const nombreStr = String(p.nombre ?? '');
        const catStr = String(p.categoria_nombre ?? '');
        return (
          idStr.toLowerCase().includes(term) ||
          nombreStr.toLowerCase().includes(term) ||
          catStr.toLowerCase().includes(term)
        );
      });
    }

    return filtered;
  }, [productos, filtroCat, filtroTxt]);

  return (
    <div className="w-100">
      <h5>Inventario</h5>

      {/* Filtros */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6">
          <select
            id="filtroCatAdmin"
            className="form-select"
            value={filtroCat}
            onChange={e => setFiltroCat(e.target.value)}
          >
            {listaCategoriasFiltro.map((cat, index) => (
              <option key={`${cat}-${index}`} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-6">
          <input
            id="filtroTxtAdmin"
            className="form-control"
            placeholder="Buscar por ID, nombre o categoría..."
            value={filtroTxt}
            onChange={e => setFiltroTxt(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla para pantallas md+ */}
      <div className="d-none d-md-block" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <div className="table-responsive">
          <table className="table">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Precio unidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => (
                <tr key={p.id}>
                  <td>{p.id ?? '—'}</td>
                  <td>{p.nombre ?? 'Sin nombre'}</td>
                  <td>{p.categoria_nombre ?? 'Sin Categoría'}</td>
                  <td>{p.cantidad ?? 0}</td>
                  <td>
                    {typeof p.precio === 'number'
                      ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })
                      : p.precio ?? '—'}
                  </td>
                  <td>
                    <span className={`badge ${p.deleted_at ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                      {p.deleted_at ? 'Inhabilitado' : 'Activo'}
                    </span>
                  </td>
                </tr>
              ))}
              {productosFiltrados.length === 0 && (
                <tr><td colSpan={6}>No hay productos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tarjetas móviles: fila horizontal desplazable (swipe) */}
      <div className="d-block d-md-none">
        <div
          className="mobile-cards-scroll"
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px',
            paddingTop: '4px',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {productosFiltrados.map(p => (
            <div
              key={p.id}
              className="card"
              style={{
                minWidth: '260px',
                maxWidth: '260px',
                flex: '0 0 auto',
                borderRadius: '8px',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
              }}
            >
              <div className="card-body">
                <h6 className="card-title text-primary mb-2" style={{ fontSize: '1rem' }}>{p.nombre ?? 'Sin nombre'}</h6>

                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">ID</span>
                  <span className="fw-semibold">{p.id ?? '—'}</span>
                </div>

                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Categoría</span>
                  <span className="fw-semibold">{p.categoria_nombre ?? 'Sin Categoría'}</span>
                </div>

                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Stock</span>
                  <span className="fw-semibold">{p.cantidad ?? 0}</span>
                </div>

                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Precio</span>
                  <span className="fw-semibold">
                    {typeof p.precio === 'number'
                      ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })
                      : p.precio ?? '—'}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Estado</span>
                  <span className={`badge ${p.deleted_at ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                    {p.deleted_at ? 'Inhabilitado' : 'Activo'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {productosFiltrados.length === 0 && (
            <div className="card" style={{ minWidth: '260px', flex: '0 0 auto' }}>
              <div className="card-body">No hay productos</div>
            </div>
          )}
        </div>

        {/* Indicador visual opcional: padding para que la última tarjeta no quede pegada al borde */}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
};

export default InventoryTab;