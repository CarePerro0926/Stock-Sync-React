// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import '../ResponsiveTable.css';
import ResponsiveTable from '../ResponsiveTable';

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

  const tableData = useMemo(() => {
    return productosFiltrados.map(p => {
      let nombreCategoria = p.categoria_nombre ? String(p.categoria_nombre).trim() : 'Sin Categoría';
      if (!nombreCategoria || nombreCategoria === 'null' || nombreCategoria === 'undefined' || nombreCategoria === '') {
        nombreCategoria = 'Sin Categoría';
      }

      return {
        id: p.id ?? '—',
        nombre: p.nombre ?? 'Sin nombre',
        categoriaNombre: nombreCategoria,
        cantidad: p.cantidad ?? 0,
        precio: typeof p.precio === 'number'
          ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })
          : p.precio ?? '—'
      };
    });
  }, [productosFiltrados]);

  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoriaNombre', label: 'Categoría' },
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' }
  ];

  console.log('Renderizando InventoryTab con productos:', productos);

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

      {/* Tabla para pantallas medianas y grandes */}
      <div className="d-none d-md-block" style={{ maxHeight: '250px', overflowY: 'auto' }}>
        <div className="table-responsive">
          <ResponsiveTable headers={tableHeaders} data={tableData} />
        </div>
      </div>

      {/* Tarjetas para pantallas pequeñas */}
      <div className="d-block d-md-none">
        <div className="row row-cols-1 g-3">
          {productosFiltrados.map(p => (
            <div className="col" key={p.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title text-primary">{p.nombre ?? 'Sin nombre'}</h6>
                  <p className="card-text mb-1"><strong>ID:</strong> {p.id ?? '—'}</p>
                  <p className="card-text mb-1"><strong>Categoría:</strong> {p.categoria_nombre ?? 'Sin Categoría'}</p>
                  <p className="card-text mb-1"><strong>Stock:</strong> {p.cantidad ?? 0}</p>
                  <p className="card-text mb-1">
                    <strong>Precio:</strong>{' '}
                    {typeof p.precio === 'number'
                      ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })
                      : p.precio ?? '—'}
                  </p>
                  <p className="card-text"><strong>Estado:</strong> {p.deleted_at ? 'Inhabilitado' : 'Activo'}</p>
                </div>
              </div>
            </div>
          ))}
          {productosFiltrados.length === 0 && (
            <div className="col">
              <div className="card"><div className="card-body">No hay productos</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;