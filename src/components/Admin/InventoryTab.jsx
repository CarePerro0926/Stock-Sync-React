// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import './InventoryTab.css'; // CSS específico para responsividad

const InventoryTab = ({ productos = [], categorias = [] }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');

  useEffect(() => {
    console.log('--- DATOS EN INVENTORYTAB ---');
    console.log('Productos recibidos:', productos);
    console.log('Categorías recibidas:', categorias);
    if (productos.length > 0) console.log('Ejemplo de producto:', productos[0]);
    if (categorias.length > 0) console.log('Ejemplo de categoría:', categorias[0]);
  }, [productos, categorias]);

  const listaCategoriasFiltro = useMemo(() => {
    const nombresDesdeProductos = productos
      .map(p => p.categoria_nombre)
      .filter(nombre => nombre && String(nombre).trim() !== '');
    const unicas = [...new Set(nombresDesdeProductos.map(nombre => String(nombre).trim()))];
    return ['Todas', ...unicas];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    let filtered = [...productos];

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
    <div className="inventory w-100">
      <h5 className="inventory-title">Inventario</h5>

      <div className="inventory-filters">
        <div className="filter-item">
          <label htmlFor="filtroCatAdmin" className="filter-label">Categoría</label>
          <select
            id="filtroCatAdmin"
            className="filter-select"
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

        <div className="filter-item">
          <label htmlFor="filtroTxtAdmin" className="filter-label">Buscar</label>
          <input
            id="filtroTxtAdmin"
            className="filter-input"
            placeholder="ID, nombre o categoría..."
            value={filtroTxt}
            onChange={e => setFiltroTxt(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla (web/desktop) */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
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
                <td>{p.deleted_at ? 'Inhabilitado' : 'Activo'}</td>
              </tr>
            ))}
            {productosFiltrados.length === 0 && (
              <tr><td colSpan={6}>No hay productos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tarjetas (móvil) */}
      <div className="inventory-cards">
        {productosFiltrados.map(p => (
          <div className="card" key={p.id}>
            <div className="card-body">
              <h6 className="card-title">{p.nombre ?? 'Sin nombre'}</h6>
              <div className="card-row">
                <span className="card-label">ID:</span>
                <span className="card-value">{p.id ?? '—'}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Categoría:</span>
                <span className="card-value">{p.categoria_nombre ?? 'Sin Categoría'}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Stock:</span>
                <span className="card-value">{p.cantidad ?? 0}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Precio:</span>
                <span className="card-value">
                  {typeof p.precio === 'number'
                    ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })
                    : p.precio ?? '—'}
                </span>
              </div>
              <div className="card-row">
                <span className="card-label">Estado:</span>
                <span className={`card-badge ${p.deleted_at ? 'badge-off' : 'badge-on'}`}>
                  {p.deleted_at ? 'Inhabilitado' : 'Activo'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {productosFiltrados.length === 0 && (
          <div className="card"><div className="card-body">No hay productos</div></div>
        )}
      </div>
    </div>
  );
};

export default InventoryTab;