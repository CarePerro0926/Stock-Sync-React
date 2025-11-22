// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo } from 'react';
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

/**
 * normalizeProducto: devuelve solo los campos que la UI necesita,
 * unificando nombres y tipos, y evitando incluir campos inesperados.
 */
const normalizeProducto = (p = {}) => {
  const idRaw = p?.id ?? p?.product_id ?? '';
  const id = idRaw === null || idRaw === undefined ? '' : String(idRaw);

  const deleted_at_raw = p?.deleted_at ?? p?.deletedAt ?? null;
  const deleted_at = normalizeDeletedAt(deleted_at_raw);
  const isDeleted = Boolean(deleted_at && String(deleted_at).trim() !== '');

  const nombre = p?.nombre ?? p?.name ?? p?.display_name ?? 'Sin nombre';
  const categoria_nombre = p?.categoria_nombre ?? p?.categoria ?? p?.category_name ?? 'Sin Categoría';
  const cantidad = typeof p?.cantidad === 'number' ? p.cantidad : (typeof p?.stock === 'number' ? p.stock : 0);
  const precio = typeof p?.precio === 'number' ? p.precio : (typeof p?.precio_unitario === 'number' ? p.precio_unitario : null);

  const disabled = normalizeBool(p?.disabled, false);
  const inactivo = normalizeBool(p?.inactivo, false);

  return {
    id,
    nombre,
    categoria_nombre,
    cantidad,
    precio,
    deleted_at: isDeleted ? deleted_at : null,
    disabled,
    inactivo,
    _inactive: Boolean(isDeleted) || disabled || inactivo
  };
};

const InventoryTab = ({ productos = [], categorias = [] }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  // Normalizamos y unificamos la estructura de los productos
  const productosNormalizados = useMemo(() => {
    return (productos || []).map(normalizeProducto);
  }, [productos]);

  const listaCategoriasFiltro = useMemo(() => {
    const nombresDesdeProductos = productosNormalizados.map(p => p.categoria_nombre).filter(Boolean);
    const unicas = [...new Set(nombresDesdeProductos.map(n => String(n).trim()))];
    const categoriasExtra = (categorias || [])
      .map(c => (c?.nombre ? String(c.nombre).trim() : ''))
      .filter(n => n && !unicas.includes(n));
    return ['Todas', ...unicas, ...categoriasExtra];
  }, [productosNormalizados, categorias]);

  const productosFiltrados = useMemo(() => {
    let filtered = [...productosNormalizados];

    // Filtrado por estado (activo / inactivo) usando _inactive para mayor robustez
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
        return idStr.toLowerCase().includes(term) || nombreStr.toLowerCase().includes(term) || catStr.toLowerCase().includes(term);
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
        precio: typeof p.precio === 'number' ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 }) : (p.precio ?? '—'),
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

      {/* Debug visual temporal: muestra los primeros productos normalizados */}
      <div className="mb-3">
        <div className="alert alert-secondary">
          <strong>DEBUG</strong>
          <div>Productos recibidos: {productos.length}</div>
          <div style={{ maxHeight: 120, overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
{JSON.stringify(productosNormalizados.slice(0, 10).map(p => ({ id: p.id, nombre: p.nombre, deleted_at: p.deleted_at, _inactive: p._inactive })), null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        <div className="table-responsive">
          {tableData.length > 0 ? (
            <ResponsiveTable headers={tableHeaders} data={tableData} />
          ) : (
            <div className="p-3 text-muted">No hay productos para mostrar con los filtros actuales.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;