// src/components/Admin/InventoryTab.js
import React, { useState, useMemo } from 'react';
import { filtroProductos } from '../../utils/helpers';

const InventoryTab = ({ productos }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');

  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map(p => p.categoria))];
    return ['Todas', ...cats];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return filtroProductos(productos, filtroTxt, filtroCat);
  }, [productos, filtroTxt, filtroCat]);

  console.log(' Productos filtrados:', productosFiltrados);

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
        <table className="table table-bordered table-sm mb-0">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoria</th>
              <th style={{ width: '60px', textAlign: 'center' }}>Stock</th>
              <th style={{ width: '120px' }}>Precio Unidad</th>
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
                  <td className="table-cell" dataTitle="ID">{p.id}</td>
                  <td className="table-cell" dataTitle="Nombre">{p.nombre}</td>
                  <td className="table-cell" dataTitle="Categoria">{p.categoria}</td>
                  <td className="table-cell" dataTitle="Stock" style={{ textAlign: 'center' }}>{p.cantidad}</td>
                  <td className="table-cell" dataTitle="Precio Unidad" style={{ textAlign: 'right' }}>
                    {typeof p.precio === 'number'
                      ? p.precio.toLocaleString('es-CO')
                      : '—'}
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