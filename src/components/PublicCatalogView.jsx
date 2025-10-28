// src/components/PublicCatalogView.jsx
import React, { useState, useMemo } from 'react';
import ResponsiveTable from './ResponsiveTable'; // Asegúrate que la ruta sea correcta

export default function PublicCatalogView({ productos = [], categorias = [], onBack }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [textoBusqueda, setTextoBusqueda] = useState('');

  const cats = Array.isArray(categorias) ? categorias : [];
  const prods = Array.isArray(productos) ? productos : [];

  const productosConNombreCategoria = useMemo(() => {
    return prods.map(p => {
      if (p.categoria_nombre) return p;
      const categoria = cats.find(c => String(c.id) === String(p.categoria_id));
      return {
        ...p,
        categoria_nombre: categoria?.nombre || 'Sin Categoría'
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

  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria_nombre', label: 'Categoría' },
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' }
  ];

  const tableData = productosFiltrados.map(p => ({
    id: p.id ?? '—',
    nombre: p.nombre ?? 'Sin nombre',
    categoria_nombre: p.categoria_nombre ?? 'Sin Categoría',
    cantidad: p.cantidad ?? 0,
    precio: typeof p.precio === 'number'
      ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })
      : p.precio ?? '—'
  }));

  return (
    <div className="card p-4">
      <h5 className="mb-3">Catálogo Público</h5>

      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <label className="form-label">Filtrar por categoría</label>
          <select
            className="form-select"
            value={categoriaSeleccionada}
            onChange={e => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="">Todas</option>
            {cats.map(cat => (
              <option key={cat.id} value={cat.nombre}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Buscar por nombre</label>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar producto..."
            value={textoBusqueda}
            onChange={e => setTextoBusqueda(e.target.value)}
          />
        </div>

        <div className="col-md-4 d-flex align-items-end">
          <button
            className="btn btn-secondary w-100"
            onClick={() => {
              setCategoriaSeleccionada('');
              setTextoBusqueda('');
              if (onBack) onBack();
            }}
          >
            Volver
          </button>
        </div>
      </div>

      {tableData.length === 0 ? (
        <p className="text-muted">No hay productos disponibles.</p>
      ) : (
        <ResponsiveTable
          headers={tableHeaders}
          data={tableData}
          maxHeight="400px"
        />
      )}
    </div>
  );
}