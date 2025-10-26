// src/components/PublicCatalogView.jsx
import React, { useState, useMemo } from 'react';

export default function PublicCatalogView({ productos = [], categorias = [], onBack }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  // Normaliza inputs por si vienen undefined
  const cats = Array.isArray(categorias) ? categorias : [];
  const prods = Array.isArray(productos) ? productos : [];

  const productosFiltrados = useMemo(() => {
    if (!categoriaSeleccionada) return prods;
    return prods.filter(p => {
      // soporta producto.categoria o producto.categoria_nombre
      const catNombreProd = p.categoria ?? p.categoria_nombre ?? '';
      return String(catNombreProd) === String(categoriaSeleccionada);
    });
  }, [prods, categoriaSeleccionada]);

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
              // usamos cat.nombre como value para empatar con productos.categoria
              <option key={cat.id ?? cat.nombre} value={cat.nombre}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button className="btn btn-secondary" onClick={() => { setCategoriaSeleccionada(''); if (onBack) onBack(); }}>
            Volver
          </button>
        </div>
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
                    <p className="card-text text-muted">{p.categoria ?? p.categoria_nombre}</p>
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