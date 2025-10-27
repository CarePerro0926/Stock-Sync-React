// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import ResponsiveTable from '../ResponsiveTable';

const InventoryTab = ({ productos = [], categorias = [], onDeleteProducto = () => {} }) => {
  // Estados
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');

  // === 1. Lista de categorías para el filtro (combinando fuentes) ===
  const listaCategoriasFiltro = useMemo(() => {
    // Categorías desde la prop `categorias`
    const fromCategorias = categorias.map(c => c.nombre);

    // Categorías extraídas directamente de los productos (por si falta sincronía)
    const fromProductos = productos
      .map(p => p.categoria ?? p.categoria_nombre)
      .filter(Boolean);

    // Combinar y eliminar duplicados, manteniendo "Todas" al inicio
    const uniqueCats = [...new Set([...fromCategorias, ...fromProductos])];
    return ['Todas', ...uniqueCats];
  }, [categorias, productos]);

  // === 2. Productos filtrados (aplica ambos filtros) ===
  const productosFiltrados = useMemo(() => {
    let filtered = [...productos];

    // Filtro por categoría
    if (filtroCat !== 'Todas') {
      filtered = filtered.filter(p => {
        const catFromProducto = p.categoria ?? p.categoria_nombre;
        if (catFromProducto) {
          return String(catFromProducto) === String(filtroCat);
        }
        if (p.categoria_id) {
          const catObj = categorias.find(c => String(c.id) === String(p.categoria_id));
          return catObj && String(catObj.nombre) === String(filtroCat);
        }
        return false;
      });
    }

    // Filtro por texto (ID, nombre o categoría)
    if (filtroTxt.trim()) {
      const term = filtroTxt.toLowerCase();
      filtered = filtered.filter(p =>
        String(p.id).toLowerCase().includes(term) ||
        String(p.nombre).toLowerCase().includes(term) ||
        String(p.categoria ?? p.categoria_nombre ?? '').toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [productos, categorias, filtroCat, filtroTxt]);

  // === 3. Datos para la tabla ===
  const tableData = useMemo(() => {
    return productosFiltrados.map(p => {
      // Determinar nombre de categoría para mostrar
      let nombreCategoria = 'Sin Categoría';
      if (p.categoria || p.categoria_nombre) {
        nombreCategoria = p.categoria || p.categoria_nombre;
      } else if (p.categoria_id) {
        const cat = categorias.find(c => String(c.id) === String(p.categoria_id));
        nombreCategoria = cat ? cat.nombre : `ID: ${p.categoria_id}`;
      }

      return {
        id: p.id,
        nombre: p.nombre,
        categoriaNombre: nombreCategoria,
        cantidad: p.cantidad,
        precio: typeof p.precio === 'number' ? p.precio.toLocaleString('es-CO') : p.precio,
        acciones: (
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onDeleteProducto(p.id)}
          >
            Eliminar
          </button>
        )
      };
    });
  }, [productosFiltrados, categorias, onDeleteProducto]);

  // === 4. Cabeceras de la tabla ===
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

      {/* Filtros */}
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
            placeholder="Buscar..."
            value={filtroTxt}
            onChange={e => setFiltroTxt(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <ResponsiveTable
        headers={tableHeaders}
        data={tableData}
        maxHeight="250px"
      />
    </div>
  );
};

export default InventoryTab;