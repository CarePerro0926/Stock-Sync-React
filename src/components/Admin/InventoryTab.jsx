// src/components/Admin/InventoryTab.jsx (Adaptado a Versión 1 con filtro externo)
import React, { useState, useMemo, useEffect } from 'react';
import { filtroProductos } from '../../utils/helpers'; // Importamos la función externa

const InventoryTab = ({ productos = [] }) => { // <-- Quitamos 'categorias' y 'onDeleteProducto'
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');

  // DIAGNÓSTICO: Ver qué datos llegan
  useEffect(() => {
    console.log('--- DATOS EN INVENTORYTAB ---');
    console.log('Productos recibidos:', productos);
    if (productos.length > 0) {
      console.log('Ejemplo de producto:', productos[0]);
    }
  }, [productos]);

  // === 1. Lista de categorías para el filtro - Ahora solo usa producto.categoria ===
  const categorias = useMemo(() => {
    // Extraer nombres de categorías de los productos, usando solo p.categoria
    const nombresDesdeProductos = productos
      .map(p => p.categoria) // <-- Solo usa p.categoria
      .filter(nombre => nombre && String(nombre).trim() !== ''); // Filtrar valores vacíos o nulos

    const unicas = [...new Set(nombresDesdeProductos.map(nombre => String(nombre).trim()))];
    return ['Todas', ...unicas];
  }, [productos]); // Solo depende de productos ahora


  // === 2. Productos filtrados - Ahora usa la función externa ===
  const productosFiltrados = useMemo(() => {
    // Llama a la función externa en lugar de la lógica interna
    return filtroProductos(productos, filtroTxt, filtroCat); // <-- Usa filtroProductos
  }, [productos, filtroTxt, filtroCat]); // Dependencias para filtro externo


  // DIAGNÓSTICO: Confirmar renderizado
  console.log("Renderizando InventoryTab con productos:", productos);

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
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
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
      <div
        className="table-responsive responsive-table"
        style={{ maxHeight: '250px', overflow: 'auto' }}
      >
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
                <td colSpan="5" className="text-center">
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              productosFiltrados.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell" dataTitle="ID">
                    {p.id}
                  </td>
                  <td className="table-cell" dataTitle="Nombre">
                    {p.nombre}
                  </td>
                  <td className="table-cell" dataTitle="Categoria">
                    {p.categoria} {/* <-- Mostramos p.categoria */}
                  </td>
                  <td
                    className="table-cell"
                    dataTitle="Stock"
                    style={{ textAlign: 'center' }}
                  >
                    {p.cantidad}
                  </td>
                  <td
                    className="table-cell"
                    dataTitle="Precio Unidad"
                    style={{ textAlign: 'right' }}
                  >
                    {p.precio.toLocaleString('es-CO')}
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