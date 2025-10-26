// src/components/PublicCatalogView.jsx
import React, { useState, useMemo } from 'react';

export default function PublicCatalogView({ productos = [], categorias = [] }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  const productosFiltrados = useMemo(() => {
    if (!categoriaSeleccionada) return productos;
    return productos.filter(p => p.categoria_id === categoriaSeleccionada);
  }, [productos, categoriaSeleccionada]);

  return (
    <div className="w-100">
      <div className="mb-3">
        <label className="form-label">Filtrar por categoría</label>
        <select
          className="form-control"
          value={categoriaSeleccionada}
          onChange={e => setCategoriaSeleccionada(e.target.value)}
        >
          <option value="">Todas</option>
          {Array.isArray(categorias) && categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        {productosFiltrados.length === 0 ? (
          <p className="text-muted">No hay productos disponibles.</p>
        ) : (
          <div className="row g-3">
            {productosFiltrados.map(p => (
              <div key={p.id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{p.nombre}</h5>
                    <p className="card-text">Precio: {p.precio}</p>
                    <p className="card-text">Cantidad: {p.cantidad}</p>
                    <p className="card-text text-muted">{p.categoria_nombre || ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}