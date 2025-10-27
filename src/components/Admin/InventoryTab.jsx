// src/components/Admin/InventoryTab.jsx
import React, { useState, useEffect } from 'react';
import ResponsiveTable from '../ResponsiveTable';

const InventoryTab = ({ productos = [], categorias = [], onDeleteProducto = () => {} }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  // Lista de nombres de categoría para el select (fallback a nombres únicos en productos)
  const listaCategoriasFiltro = React.useMemo(() => {
    const fromCategorias = Array.isArray(categorias) && categorias.length > 0
      ? categorias.map(c => c.nombre)
      : [];
    const fromProductos = Array.isArray(productos)
      ? [...new Set(productos.map(p => p.categoria ?? p.categoria_nombre).filter(Boolean))]
      : [];
    const combined = [...new Set(['Todas', ...fromCategorias, ...fromProductos])];
    return combined;
  }, [categorias, productos]);

  // Aplicar filtros: comparaciones por NOMBRE de categoría (igual que el primer componente)
  useEffect(() => {
    let filtered = Array.isArray(productos) ? [...productos] : [];

    // Filtrado por categoría por NOMBRE
    if (filtroCat && filtroCat !== 'Todas') {
      filtered = filtered.filter(p => {
        const nombreDesdeProducto = p.categoria ?? p.categoria_nombre ?? null;
        if (nombreDesdeProducto) {
          return String(nombreDesdeProducto) === String(filtroCat);
        }
        // si producto solo tiene categoria_id, buscar nombre en categorias
        if (p.categoria_id && Array.isArray(categorias)) {
          const catObj = categorias.find(c => String(c.id) === String(p.categoria_id));
          if (catObj) return String(catObj.nombre) === String(filtroCat);
        }
        return false;
      });
    }

    // Filtrado por texto (id o nombre)
    if (filtroTxt && filtroTxt.trim() !== '') {
      const txtLower = filtroTxt.toLowerCase();
      filtered = filtered.filter(p => {
        const idMatch = String(p.id ?? '').toLowerCase().includes(txtLower);
        const nombreMatch = String(p.nombre ?? '').toLowerCase().includes(txtLower);
        const categoriaMatch = String(p.categoria ?? p.categoria_nombre ?? '').toLowerCase().includes(txtLower);
        return idMatch || nombreMatch || categoriaMatch;
      });
    }

    setProductosFiltrados(filtered);
  }, [productos, categorias, filtroCat, filtroTxt]);

  // Preparar datos para ResponsiveTable (mostrar nombre de categoría)
  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoriaNombre', label: 'Categoria' },
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
  ];

  const tableData = productosFiltrados.map(p => {
    let nombreCategoria = 'Sin Categoría';
    if (p.categoria ?? p.categoria_nombre) {
      nombreCategoria = p.categoria ?? p.categoria_nombre;
    } else if (p.categoria_id && Array.isArray(categorias)) {
      const catObj = categorias.find(c => String(c.id) === String(p.categoria_id));
      if (catObj) nombreCategoria = catObj.nombre;
      else nombreCategoria = `ID: ${p.categoria_id}`;
    }

    return {
      id: p.id,
      nombre: p.nombre,
      categoriaNombre: nombreCategoria,
      cantidad: p.cantidad,
      precio: (typeof p.precio === 'number') ? p.precio.toLocaleString('es-CO') : p.precio,
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

  return (
    <div>
      <h5>Inventario</h5>

      <div className="row g-2 mb-3">
        <div className="col">
          <select
            id="filtroCatAdmin"
            className="form-select"
            value={filtroCat}
            onChange={(e) => setFiltroCat(e.target.value)}
          >
            {listaCategoriasFiltro.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="col">
          <input
            id="filtroTxtAdmin"
            className="form-control"
            placeholder="Buscar..."
            value={filtroTxt}
            onChange={(e) => setFiltroTxt(e.target.value)}
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