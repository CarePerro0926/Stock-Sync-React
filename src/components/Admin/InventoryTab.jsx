// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo, useEffect } from 'react';

// Se eliminó onDeleteProducto de la lista de props
const InventoryTab = ({ productos = [], categorias = [] }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');

  useEffect(() => {
    console.log('--- DATOS EN INVENTORYTAB ---');
    console.log('Productos recibidos:', productos);
    console.log('Categorías recibidas:', categorias);
    if (productos.length > 0) {
      console.log('Ejemplo de producto:', productos[0]);
    }
    if (categorias.length > 0) {
      console.log('Ejemplo de categoría:', categorias[0]);
    }
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

      <div className="row g-2 mb-3">
        <div className="col">
          <select
            id="filtroCatAdmin"
            className="form-select"
            value={filtroCat}
            onChange={e => setFiltroCat(e.target.value)}
          >
            {listaCategoriasFiltro.map((cat, index) => (
              <option key={`${cat}-${index}`} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="col">
          <input
            id="filtroTxtAdmin"
            className="form-control"
            placeholder="Buscar por ID, nombre o categoría..."
            value={filtroTxt}
            onChange={e => setFiltroTxt(e.target.value)}
          />
        </div>
      </div>

      {/* Contenedor único con desplazamiento vertical para tabla y tarjetas */}
      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        {/* Tabla para pantallas md+ */}
        <div className="d-none d-md-block">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
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
                      <span className={`badge ${p.deleted_at ? 'bg-danger text-white' : 'bg-success text-white'}`}>
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

        {/* Tarjetas en móvil: apiladas verticalmente dentro del mismo contenedor desplazable */}
        <div className="d-block d-md-none">
          <div className="row g-3 p-1">
            {productosFiltrados.map(p => (
              <div className="col-12" key={p.id}>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">{p.nombre ?? 'Sin nombre'}</h6>
                      <span className={`badge ${p.deleted_at ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                        {p.deleted_at ? 'Inhabilitado' : 'Activo'}
                      </span>
                    </div>

                    <div className="row small text-muted">
                      <div className="col-6 mb-1">
                        <div>ID</div>
                        <div className="fw-semibold text-dark">{p.id ?? '—'}</div>
                      </div>
                      <div className="col-6 mb-1">
                        <div>Categoría</div>
                        <div className="fw-semibold text-dark">{p.categoria_nombre ?? 'Sin Categoría'}</div>
                      </div>
                      <div className="col-6 mb-1">
                        <div>Stock</div>
                        <div className="fw-semibold text-dark">{p.cantidad ?? 0}</div>
                      </div>
                      <div className="col-6 mb-1">
                        <div>Precio</div>
                        <div className="fw-semibold text-dark">
                          {typeof p.precio === 'number'
                            ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })
                            : p.precio ?? '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {productosFiltrados.length === 0 && (
              <div className="col-12">
                <div className="card"><div className="card-body">No hay productos</div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;