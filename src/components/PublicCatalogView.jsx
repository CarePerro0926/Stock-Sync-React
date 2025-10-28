// src/components/PublicCatalogView.jsx
import React, { useState, useMemo } from 'react';

export default function PublicCatalogView({ productos = [], categorias = [], onBack }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [textoBusqueda, setTextoBusqueda] = useState('');

  const cats = Array.isArray(categorias) ? categorias : [];
  const prods = Array.isArray(productos) ? productos : [];

  const productosConNombreCategoria = useMemo(() => {
    return prods.map(p => {
      if (p.categoria_nombre) return p;

      if (p.categoria) {
        return { ...p, categoria_nombre: p.categoria };
      }

      const categoria = cats.find(c => String(c.id) === String(p.categoria_id));

      return {
        ...p,
        categoria_nombre: categoria?.nombre || 'Categoría Desconocida'
      };
    });
  }, [prods, cats]);

  const productosFiltrados = useMemo(() => {
    return productosConNombreCategoria.filter(p => {
      const coincideCategoria =
        !categoriaSeleccionada || String(p.categoria_nombre) === String(categoriaSeleccionada);
      const coincideTexto =
        textoBusqueda === '' || p.nombre.toLowerCase().includes(textoBusqueda.toLowerCase());
      return coincideCategoria && coincideTexto;
    });
  }, [productosConNombreCategoria, categoriaSeleccionada, textoBusqueda]);

  return (
    <div className="card p-4">
      <h4 className="text-stock">Inventario Disponible</h4>
      <div className="row g-2 mb-3">
        <div className="col">
          <select
            id="filtroCatPublic"
            className="form-select"
            value={categoriaSeleccionada}
            onChange={e => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="Todas">Todas</option>
            {cats.map(cat => (
              <option key={cat.id ?? cat.nombre} value={cat.nombre}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col">
          <input
            id="filtroTxtPublic"
            className="form-control"
            placeholder="Buscar..."
            value={textoBusqueda}
            onChange={e => setTextoBusqueda(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive responsive-table" style={{ maxHeight: '300px', overflow: 'auto' }}>
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
          <tbody id="tblCatalogPublic">
            {productosFiltrados.length === 0 ? (
              <tr><td colSpan="5" className="text-center">No se encontraron productos.</td></tr>
            ) : (
              productosFiltrados.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell" dataTitle="ID">{p.id}</td>
                  <td className="table-cell" dataTitle="Nombre">{p.nombre}</td>
                  <td className="table-cell" dataTitle="Categoria">{p.categoria_nombre}</td>
                  <td className="table-cell" dataTitle="Stock" style={{ textAlign: 'center' }}>{p.cantidad}</td>
                  <td className="table-cell" dataTitle="Precio Unidad" style={{ textAlign: 'right' }}>
                    {p.precio != null ? p.precio.toLocaleString('es-CO') : p.precio}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="text-end mt-3">
        <button onClick={onBack} id="btnBackToLogin" className="btn btn-outline-secondary">Regresar</button>
      </div>
    </div>
  );
}