// src/components/PublicCatalogView.jsx
import React, { useState, useMemo, useEffect } from 'react';
import ResponsiveTable from './ResponsiveTable';

export default function PublicCatalogView({ productos = [], categorias = [], onBack }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="card p-4 w-100"> {/* w-100 agregado */}
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

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {tableData.length === 0 ? (
          <p className="text-muted">No hay productos disponibles.</p>
        ) : isMobile ? (
          <div className="row g-3">
            {productosFiltrados.map(p => (
              <div key={p.id} className="col-12">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title mb-1">{p.nombre}</h6>
                    <p className="mb-1"><strong>Categoría:</strong> {p.categoria_nombre}</p>
                    <p className="mb-1"><strong>Stock:</strong> {p.cantidad}</p>
                    <p className="mb-0"><strong>Precio:</strong> {p.precio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="table-responsive"> {/* envuelve en table-responsive */}
            <ResponsiveTable headers={tableHeaders} data={tableData} />
          </div>
        )}
      </div>
    </div>
  );
}