// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { filtroProductos } from '../../utils/helpers';

const InventoryTab = ({ productos = [] }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 767.98);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map(p => p.categoria))];
    return ['Todas', ...cats];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return filtroProductos(productos, filtroTxt, filtroCat);
  }, [productos, filtroTxt, filtroCat]);

  return (
    <>
      <h5>Inventario</h5>

      <div className="row g-2 mb-3">
        <div className="col">
          <select
            id="filtroCatAdmin"
            className="form-select"
            value={filtroCat}
            onChange={(e) => setFiltroCat(e.target.value)}
          >
            {categorias.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col">
          <input
            id="filtroTxtAdmin"
            className="form-control"
            placeholder="Buscar..."
            value={filtroTxt}
            onChange={(e) => setFiltroTxt(e.target.value)}
          />
        </div>
      </div>

      {isMobile ? (
        // Mobile: lista de tarjetas (labels visibles)
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {productosFiltrados.length === 0 ? (
            <div className="card p-3 text-center">No se encontraron productos.</div>
          ) : productosFiltrados.map(p => (
            <div key={p.id} className="card p-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#6c757d' }}>ID</strong>
                <span>{p.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#6c757d' }}>Nombre</strong>
                <span>{p.nombre}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#6c757d' }}>Categoría</strong>
                <span>{p.categoria}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#6c757d' }}>Unidad disponible</strong>
                <span>{p.cantidad}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#6c757d' }}>Valor unidad</strong>
                <span>{typeof p.precio === 'number' ? p.precio.toLocaleString('es-CO') : (p.precio ?? '—')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop: tabla tradicional
        <div className="table-responsive responsive-table" style={{ maxHeight: '400px', overflow: 'auto' }}>
          <table className="table table-bordered table-sm mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoria</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Unidad disponible</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Valor unidad</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No se encontraron productos.</td>
                </tr>
              ) : productosFiltrados.map(p => (
                <tr key={p.id}>
                  <td data-title="ID">{p.id}</td>
                  <td data-title="Nombre">{p.nombre}</td>
                  <td data-title="Categoria">{p.categoria}</td>
                  <td data-title="Unidad disponible" style={{ textAlign: 'center' }}>{p.cantidad}</td>
                  <td data-title="Valor unidad" style={{ textAlign: 'right' }}>
                    {typeof p.precio === 'number' ? p.precio.toLocaleString('es-CO') : (p.precio ?? '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default InventoryTab;