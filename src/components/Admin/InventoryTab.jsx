// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import ResponsiveTable from '../ResponsiveTable';
import '../ResponsiveTable.css';

const normalizeDeletedAt = (val) => {
  if (val === null || val === undefined) return null;
  const s = String(val).trim().toLowerCase();
  if (s === '' || s === 'null' || s === 'undefined') return null;
  return val;
};

const normalizeBool = (val, defaultValue = false) => {
  if (val === null || val === undefined) return defaultValue;
  if (typeof val === 'boolean') return val;
  const s = String(val).trim().toLowerCase();
  return !(s === '' || s === '0' || s === 'false' || s === 'no' || s === 'null' || s === 'undefined');
};

const normalizeProducto = (p) => {
  const deleted_at_raw = p?.deleted_at;
  const deleted_at = normalizeDeletedAt(deleted_at_raw);
  const disabled = normalizeBool(p?.disabled, false);
  const inactivo = normalizeBool(p?.inactivo, false);
  const isDeleted = Boolean(deleted_at && String(deleted_at).trim() !== '');
  return {
    ...p,
    deleted_at: isDeleted ? deleted_at : null,
    disabled,
    inactivo,
    nombre: p?.nombre ?? '',
    categoria_nombre: p?.categoria_nombre ?? '',
    cantidad: p?.cantidad ?? 0,
    precio: p?.precio ?? null,
    _inactive: Boolean(isDeleted) || disabled || inactivo
  };
};

const InventoryTab = ({ productos = [], categorias = [] }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  // Normalizamos la lista de productos recibida para evitar inconsistencias
  const productosNormalizados = useMemo(() => {
    return (productos || []).map(normalizeProducto);
  }, [productos]);

  useEffect(() => {
    // Logs de depuración (puedes quitar estos console.log en producción)
    console.log('InventoryTab: productos recibidos (raw):', productos);
    console.log('InventoryTab: productos normalizados:', productosNormalizados);
  }, [productos, productosNormalizados]);

  const listaCategoriasFiltro = useMemo(() => {
    const nombresDesdeProductos = productosNormalizados
      .map(p => p.categoria_nombre)
      .filter(nombre => nombre && String(nombre).trim() !== '');
    const unicas = [...new Set(nombresDesdeProductos.map(nombre => String(nombre).trim()))];
    // También incluir categorías pasadas por props si no están en productos
    const categoriasExtra = (categorias || [])
      .map(c => (c?.nombre ? String(c.nombre).trim() : ''))
      .filter(n => n && !unicas.includes(n));
    return ['Todas', ...unicas, ...categoriasExtra];
  }, [productosNormalizados, categorias]);

  const productosFiltrados = useMemo(() => {
    let filtered = [...productosNormalizados];

    // Filtrar por estado (activo / inactivo) usando _inactive para mayor robustez
    if (mostrarInactivos) {
      filtered = filtered.filter(p => !!(p._inactive || p.deleted_at || p.disabled || p.inactivo));
    } else {
      filtered = filtered.filter(p => !(p._inactive || p.deleted_at || p.disabled || p.inactivo));
    }

    // Filtrar por categoría
    if (filtroCat !== 'Todas') {
      const filtroCatStr = String(filtroCat).trim();
      filtered = filtered.filter(p => {
        const nombreCategoria = p.categoria_nombre;
        return nombreCategoria && String(nombreCategoria).trim() === filtroCatStr;
      });
    }

    // Filtrar por texto (ID, nombre, categoría)
    if (filtroTxt.trim()) {
      const term = filtroTxt.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const idStr = String(p.id ?? '');
        const nombreStr = String(p.nombre ?? '');
        const catStr = String(p.categoria_nombre ?? '');
        return (
          idStr.toLowerCase().includes(term) ||
          nombreStr.toLowerCase().includes(term) ||
          catStr.toLowerCase().includes(term)
        );
      });
    }

    return filtered;
  }, [productosNormalizados, filtroCat, filtroTxt, mostrarInactivos]);

  const tableData = useMemo(() => {
    return productosFiltrados.map(p => {
      let nombreCategoria = p.categoria_nombre ? String(p.categoria_nombre).trim() : 'Sin Categoría';
      if (!nombreCategoria || nombreCategoria === 'null' || nombreCategoria === 'undefined' || nombreCategoria === '') {
        nombreCategoria = 'Sin Categoría';
      }

      return {
        id: p.id ?? '—',
        nombre: p.nombre ?? 'Sin nombre',
        categoriaNombre: nombreCategoria,
        cantidad: p.cantidad ?? 0,
        precio: typeof p.precio === 'number'
          ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })
          : (p.precio ?? '—'),
        _inactive: !!(p._inactive || p.deleted_at || p.disabled || p.inactivo)
      };
    });
  }, [productosFiltrados]);

  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoriaNombre', label: 'Categoría' },
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' }
  ];

  return (
    <div className="w-100">
      <h5>Inventario</h5>

      <div className="row g-2 mb-3">
        <div className="col-md-4 col-12">
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

        <div className="col-md-4 col-12">
          <input
            id="filtroTxtAdmin"
            className="form-control"
            placeholder="Buscar por ID, nombre o categoría..."
            value={filtroTxt}
            onChange={e => setFiltroTxt(e.target.value)}
          />
        </div>

        <div className="col-md-4 col-12 d-flex align-items-center">
          <div className="form-check ms-md-3">
            <input
              id="chkMostrarInactivosProd"
              className="form-check-input"
              type="checkbox"
              checked={mostrarInactivos}
              onChange={e => setMostrarInactivos(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="chkMostrarInactivosProd">Mostrar inactivos</label>
          </div>
        </div>
      </div>

      {/* Debug visual temporal: muestra los primeros productos y su estado.
          Quitar en producción si no se necesita. */}
      <div className="mb-3">
        <div className="alert alert-secondary">
          <strong>DEBUG</strong>
          <div>Productos recibidos: {productos.length}</div>
          <div style={{ maxHeight: 120, overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
              {JSON.stringify(productos.slice(0, 10).map(p => ({ id: p.id, deleted_at: p.deleted_at, _inactive: p._inactive })), null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        <div className="table-responsive">
          <ResponsiveTable headers={tableHeaders} data={tableData} />
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;