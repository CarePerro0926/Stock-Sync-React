// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import '../ResponsiveTable.css';
import ResponsiveTable from '../ResponsiveTable';

// InventoryTab con logging y filtro defensivo contra "producto de ejemplo"
const InventoryTab = ({ productos = [], categorias = [] }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');

  // Log inicial para inspección rápida
  useEffect(() => {
    console.log('--- DATOS EN INVENTORYTAB (RAW) ---');
    console.log('productos prop (raw):', productos);
    console.log('categorias prop (raw):', categorias);
    if (productos && productos.length > 0) {
      console.log('Primer producto raw:', productos[0]);
    }
  }, [productos, categorias]);

  // Lista de categorías para el select (desde productos)
  const listaCategoriasFiltro = useMemo(() => {
    const nombresDesdeProductos = (productos || [])
      .map(p => p?.categoria_nombre ?? p?.categoria ?? '')
      .filter(nombre => nombre && String(nombre).trim() !== '');
    const unicas = [...new Set(nombresDesdeProductos.map(nombre => String(nombre).trim()))];
    return ['Todas', ...unicas];
  }, [productos]);

  // Heurística para detectar filas de "ejemplo" o placeholders
  const isPlaceholderProduct = (p) => {
    if (!p) return true;
    const nombre = String(p.nombre ?? p.name ?? p.display_name ?? '').toLowerCase();
    const id = String(p.id ?? p.product_id ?? '').toLowerCase();
    // Filtrar nombres que contengan 'ejemplo' o 'producto de ejemplo' o ids evidentes
    if (nombre.includes('ejemplo') || nombre.includes('producto de ejemplo')) return true;
    if (id === 'example' || id === 'sample' || id === 'demo') return true;
    return false;
  };

  // Filtrado principal (categoría + texto) + eliminación de placeholders
  const productosFiltrados = useMemo(() => {
    let filtered = Array.isArray(productos) ? [...productos] : [];

    // eliminar placeholders evidentes antes de cualquier filtro
    filtered = filtered.filter(p => !isPlaceholderProduct(p));

    if (filtroCat !== 'Todas') {
      const filtroCatStr = String(filtroCat).trim();
      filtered = filtered.filter(p => {
        const nombreCategoria = p?.categoria_nombre ?? p?.categoria ?? '';
        return nombreCategoria && String(nombreCategoria).trim() === filtroCatStr;
      });
    }

    if (filtroTxt && filtroTxt.trim()) {
      const term = filtroTxt.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const idStr = String(p?.id ?? p?.product_id ?? '');
        const nombreStr = String(p?.nombre ?? p?.name ?? p?.display_name ?? '');
        const catStr = String(p?.categoria_nombre ?? p?.categoria ?? '');
        return (
          idStr.toLowerCase().includes(term) ||
          nombreStr.toLowerCase().includes(term) ||
          catStr.toLowerCase().includes(term)
        );
      });
    }

    return filtered;
  }, [productos, filtroCat, filtroTxt]);

  // Construcción de datos para la tabla (normalizando campos)
  const tableData = useMemo(() => {
    const data = (productosFiltrados || []).map(p => {
      // normalizar id y nombre
      const idRaw = p?.id ?? p?.product_id ?? p?._raw?.product_id ?? '';
      const id = idRaw === null || idRaw === undefined ? '' : String(idRaw);
      let nombre = p?.nombre ?? p?.name ?? p?._raw?.nombre ?? p?._raw?.name ?? '';
      nombre = (nombre === null || nombre === undefined) ? '' : String(nombre);

      let nombreCategoria = p?.categoria_nombre ?? p?.categoria ?? p?._raw?.categoria_nombre ?? 'Sin Categoría';
      if (!nombreCategoria || String(nombreCategoria).trim() === '' || ['null', 'undefined'].includes(String(nombreCategoria).toLowerCase())) {
        nombreCategoria = 'Sin Categoría';
      }

      const cantidad = (typeof p?.cantidad === 'number') ? p.cantidad : (p?._raw?.cantidad ?? p?._raw?.stock ?? 0);
      const precioRaw = p?.precio ?? p?._raw?.precio ?? p?._raw?.precio_unitario ?? p?._raw?.unit_price ?? null;
      const precio = (typeof precioRaw === 'number') ? precioRaw.toLocaleString('es-CO', { minimumFractionDigits: 0 }) : (precioRaw ?? '—');

      return {
        id: id || '—',
        nombre: nombre || 'Sin nombre',
        categoriaNombre: nombreCategoria,
        cantidad: cantidad ?? 0,
        precio
      };
    });

    console.log('--- DATOS EN INVENTORYTAB (PROCESADOS) ---');
    console.log('productosFiltrados.length =', productosFiltrados.length);
    console.log('tableData (primeros 5):', data.slice(0, 5));
    return data;
  }, [productosFiltrados]);

  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoriaNombre', label: 'Categoría' },
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' }
  ];

  // Render
  return (
    <div className="w-100">
      <h5>Inventario</h5>

      <div className="row g-2 mb-3">
        <div className="col">
          <select
            id="filtroCatAdmin"
            className="form-select"
            value={filtroCat}
            onChange={e => setFiltroCat(e.target.value)}
          >
            {listaCategoriasFiltro.map((cat, index) => (
              <option key={`${cat}-${index}`} value={cat}>
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

      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        <div className="table-responsive">
          <ResponsiveTable
            headers={tableHeaders}
            data={tableData}
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;