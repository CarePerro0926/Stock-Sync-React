// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { filtroProductos } from '../../utils/helpers';

const InventoryTab = ({ productos = [] }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const tableRef = useRef(null);

  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map(p => p.categoria))];
    return ['Todas', ...cats];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return filtroProductos(productos, filtroTxt, filtroCat);
  }, [productos, filtroTxt, filtroCat]);

  // Fallback: asegura que cada <td> tenga data-title (útil si hay transformaciones dinámicas)
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    const ths = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    table.querySelectorAll('tbody tr').forEach(tr => {
      const tds = Array.from(tr.querySelectorAll('td'));
      tds.forEach((td, i) => {
        if (!td.hasAttribute('data-title')) {
          td.setAttribute('data-title', ths[i] || '');
        }
      });
    });
  }, [productosFiltrados]);

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

      <div className="table-responsive responsive-table" style={{ maxHeight: '250px', overflow: 'auto' }}>
        <table ref={tableRef} className="table table-bordered table-sm mb-0">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoria</th>
              <th style={{ width: '60px', textAlign: 'center' }}>Unidad disponible</th>
              <th style={{ width: '120px' }}>Valor unidad</th>
            </tr>
          </thead>
          <tbody id="tblAdminInv">
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No se encontraron productos.</td>
              </tr>
            ) : (
              productosFiltrados.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell" data-title="ID">{p.id}</td>
                  <td className="table-cell" data-title="Nombre">{p.nombre}</td>
                  <td className="table-cell" data-title="Categoria">{p.categoria}</td>
                  <td className="table-cell" data-title="Unidad disponible" style={{ textAlign: 'center' }}>{p.cantidad}</td>
                  <td className="table-cell" data-title="Valor unidad" style={{ textAlign: 'right' }}>
                    {typeof p.precio === 'number' ? p.precio.toLocaleString('es-CO') : p.precio ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default InventoryTab;