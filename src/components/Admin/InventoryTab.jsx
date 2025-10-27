// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo } from 'react';
import ResponsiveTable from '../ResponsiveTable';

const InventoryTab = ({ productos = [], categorias = [], onDeleteProducto = () => {} }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');

  // === 1. Lista de categorías para el filtro ===
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

  // === 3. Datos para la tabla — CORRECCIÓN CLAVE AQUÍ ===
  const tableData = useMemo(() => {
    return productosFiltrados.map(p => {
      let nombreCategoria = 'Sin Categoría';

      // 👇 PRIMERO: intentar usar el nombre directamente
      if (p.categoria) {
        nombreCategoria = p.categoria.toString();
      } else if (p.categoria_nombre) {
        nombreCategoria = p.categoria_nombre.toString();
      }
      // 👇 SEGUNDO: si solo tiene ID, buscar en categorias
      else if (p.categoria_id != null) {
        const cat = categorias.find(c =>
          String(c.id).trim() === String(p.categoria_id).trim()
        );
        if (cat) {
          nombreCategoria = cat.nombre;
        } else {
          // 👇 Si no encuentra categoría, mostrar ID para debugging
          nombreCategoria = `ID: ${p.categoria_id} (no encontrada)`;
        }
      }

      return {
        id: p.id ?? '—',
        nombre: p.nombre ?? 'Sin nombre',
        categoriaNombre: nombreCategoria, // ← esto se muestra en la tabla
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
            placeholder="Buscar..."
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