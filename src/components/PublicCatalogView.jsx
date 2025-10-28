// src/components/PublicCatalogView.jsx
import React, { useState, useMemo } from 'react';

export default function PublicCatalogView({ productos = [], categorias = [], onBack }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [textoBusqueda, setTextoBusqueda] = useState('');

  // Normaliza inputs por si vienen undefined
  const cats = Array.isArray(categorias) ? categorias : [];
  const prods = Array.isArray(productos) ? productos : [];

  // LOGS DE VERIFICACIÓN
  console.log("CATEGORIAS RECIBIDAS:", cats);
  console.log("PRODUCTOS ORIGINALES:", prods);

  // Mapear categoria_id a nombre si es necesario
  const productosConNombreCategoria = useMemo(() => {
    const resultado = prods.map(p => {
      if (p.categoria_nombre) return p;

      const categoria = cats.find(c => String(c.id) === String(p.categoria_id));
      return {
        ...p,
        categoria_nombre: categoria?.nombre || 'Categoría Desconocida'
      };
    });

    console.log("PRODUCTOS CON NOMBRE DE CATEGORÍA:", resultado);
    return resultado;
  }, [prods, cats]);

  // Filtrar por categoría y texto
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