// src/components/PublicCatalogView.jsx
import React, { useState, useMemo } from 'react';
import ResponsiveTable from './ResponsiveTable'; // Ajusta la ruta si es diferente

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

  // Cabeceras para la tabla
  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria_nombre', label: 'Categoría' },
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' }
  ];

  // Datos para la tabla
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
    <div className="w-100">
      <div className="mb-3 d-flex align-items-end gap-2">
        <div style={{ flex: 1 }}>
          <label className="form-label">Filtrar por categoría</label>
          <select
            className="form-control"
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

        <div style={{ flex: 1 }}>
          <label className="form-label">Buscar por nombre</label>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar producto..."
            value={textoBusqueda}
            onChange={e => setTextoBusqueda(e.target.value)}
          />
        </div>

        <div>
          <button
            className="btn btn-secondary"
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

      <div>
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
    </div>
  );
}