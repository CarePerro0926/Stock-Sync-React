// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo } from 'react';
import ResponsiveTable from '../ResponsiveTable';

const InventoryTab = ({ productos = [], categorias = [], onDeleteProducto = () => {} }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');

  // === 1. Lista de categorías para el filtro (combinando fuentes) ===
  const listaCategoriasFiltro = useMemo(() => {
    const fromCategorias = categorias.map(c => c.nombre).filter(Boolean);
    const fromProductos = productos
      .map(p => p.categoria ?? p.categoria_nombre)
      .filter(Boolean);

    const uniqueCats = [...new Set([...fromCategorias, ...fromProductos])];
    return ['Todas', ...uniqueCats];
  }, [categorias, productos]);

  // === 2. Productos filtrados ===
  const productosFiltrados = useMemo(() => {
    let filtered = [...productos];

    // Filtro por categoría
    if (filtroCat !== 'Todas') {
      filtered = filtered.filter(p => {
        const catFromProducto = p.categoria ?? p.categoria_nombre;
        if (catFromProducto) {
          return String(catFromProducto).trim() === String(filtroCat).trim();
        }
        if (p.categoria_id != null) {
          const catObj = categorias.find(c =>
            String(c.id).trim() === String(p.categoria_id).trim()
          );
          return catObj && String(catObj.nombre).trim() === String(filtroCat).trim();
        }
        return false;
      });
    }

    // Filtro por texto
    if (filtroTxt.trim()) {
      const term = filtroTxt.toLowerCase().trim();
      filtered = filtered.filter(p =>
        String(p.id ?? '').toLowerCase().includes(term) ||
        String(p.nombre ?? '').toLowerCase().includes(term) ||
        String(p.categoria ?? p.categoria_nombre ?? '').toLowerCase().includes(term) ||
        (p.categoria_id != null &&
          categorias.some(c =>
            String(c.id) === String(p.categoria_id) &&
            String(c.nombre).toLowerCase().includes(term)
          ))
      );
    }

    return filtered;
  }, [productos, categorias, filtroCat, filtroTxt]);

  // === 3. Datos para la tabla (con categoría siempre visible) ===
  const tableData = useMemo(() => {
    return productosFiltrados.map(p => {
      let nombreCategoria = 'Sin Categoría';

      // Si el producto ya tiene el nombre directamente
      if (p.categoria || p.categoria_nombre) {
        nombreCategoria = (p.categoria || p.categoria_nombre).toString();
      }
      // Si solo tiene ID, buscar en la lista de categorías
      else if (p.categoria_id != null && categorias.length > 0) {
        const cat = categorias.find(c =>
          String(c.id).trim() === String(p.categoria_id).trim()
        );
        nombreCategoria = cat ? cat.nombre : `ID: ${p.categoria_id}`;
      }

      return {
        id: p.id ?? '—',
        nombre: p.nombre ?? 'Sin nombre',
        categoriaNombre: nombreCategoria,
        cantidad: p.cantidad ?? 0,
        precio: typeof p.precio === 'number'
          ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })
          : p.precio ?? '—',
        acciones: (
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onDeleteProducto(p.id)}
            disabled={!p.id}
          >
            Eliminar
          </button>
        )
      };
    });
  }, [productosFiltrados, categorias, onDeleteProducto]);

  // === 4. Cabeceras ===
  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoriaNombre', label: 'Categoría' },
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
  ];

  // === Render ===
  return (
    <div>
      <h5>Inventario</h5>

      <div className="row g-2 mb-3">
        <div className="col">
          <select
            id="filtroCatAdmin"
            className="form-select"
            value={filtroCat}
            onChange={e => setFiltroCat(e.target.value)}
          >
            {listaCategoriasFiltro.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="col">
          <input
            id="filtroTxtAdmin"
            className="form-control"
            placeholder="Buscar por ID, nombre o categoría..."
            value={filtroTxt}
            onChange={e => setFiltroTxt(e.target.value)}
          />
        </div>
      </div>

      <ResponsiveTable
        headers={tableHeaders}
        data={tableData}
        maxHeight="250px"
      />
    </div>
  );
};

export default InventoryTab;