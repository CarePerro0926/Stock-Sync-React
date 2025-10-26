// src/components/PublicCatalogView.jsx
import React, { useState, useMemo } from 'react';

export default function PublicCatalogView({ productos = [], categorias = [], onBack }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  // Normaliza inputs por si vienen undefined
  const cats = Array.isArray(categorias) ? categorias : [];
  const prods = Array.isArray(productos) ? productos : [];

  // Mapear categoria_id a nombre si es necesario
  const productosConNombreCategoria = useMemo(() => {
    return prods.map(p => {
      if (p.categoria_nombre) {
        // Si ya tiene categoria_nombre, devolverlo como está
        return p;
      } else if (p.categoria_id) {
        // Si tiene categoria_id, buscar el nombre
        const categoria = cats.find(c => c.id === p.categoria_id);
        return { ...p, categoria_nombre: categoria ? categoria.nombre : 'Categoría Desconocida' };
      } else if (p.categoria) {
        // Si tiene categoria (nombre directo), devolverlo como está (compatibilidad con initialData)
        return { ...p, categoria_nombre: p.categoria };
      }
      // Si no tiene ninguno, asignar un nombre por defecto
      return { ...p, categoria_nombre: 'Sin Categoría' };
    });
  }, [prods, cats]);

  const productosFiltrados = useMemo(() => {
    if (!categoriaSeleccionada) return productosConNombreCategoria;
    return productosConNombreCategoria.filter(p => {
      // Ahora siempre usamos p.categoria_nombre
      const catNombreProd = p.categoria_nombre;
      return String(catNombreProd) === String(categoriaSeleccionada);
    });
  }, [productosConNombreCategoria, categoriaSeleccionada]);

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
              // usamos cat.nombre como value para empatar con productos.categoria_nombre
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
                    <p className="card-text text-muted">{p.categoria_nombre}</p>
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