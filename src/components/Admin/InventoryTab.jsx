// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo } from 'react';
import ResponsiveTable from '../ResponsiveTable';
import '../ResponsiveTable.css';

/**
 * Normaliza deleted_at:
 * - devuelve null si está vacío, 'null', 'undefined' o no existe
 * - devuelve la cadena original (trim) si parece una fecha/valor válido
 */
const normalizeDeletedAt = (val) => {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return null;
  return s;
};

/**
 * Normaliza booleanos que pueden venir como string/number
 */
const normalizeBool = (val, defaultValue = false) => {
  if (val === null || val === undefined) return defaultValue;
  if (typeof val === 'boolean') return val;
  const s = String(val).trim().toLowerCase();
  if (s === '') return defaultValue;
  if (['1', 'true', 'yes', 'y'].includes(s)) return true;
  if (['0', 'false', 'no', 'n'].includes(s)) return false;
  // fallback: si es texto no vacío, considerarlo true
  return true;
};

/**
 * normalizeProducto: debe coincidir con la normalización en AdminView.
 * - deleted_at se normaliza a null o string limpio
 * - disabled / inactivo se normalizan a boolean
 * - _inactive se calcula de forma determinista a partir de los campos anteriores
 */
const normalizeProducto = (p = {}) => {
  const idRaw = p?.id ?? p?.product_id ?? '';
  const id = idRaw === null || idRaw === undefined ? '' : String(idRaw);

  const deleted_at_raw = p?.deleted_at ?? p?.deletedAt ?? null;
  const deleted_at = normalizeDeletedAt(deleted_at_raw);

  const nombre = p?.nombre ?? p?.name ?? p?.display_name ?? 'Sin nombre';
  const categoria_nombre = p?.categoria_nombre ?? p?.categoria ?? p?.category_name ?? 'Sin Categoría';

  const cantidad = typeof p?.cantidad === 'number'
    ? p.cantidad
    : (typeof p?.stock === 'number' ? p.stock : 0);

  let precio = null;
  if (typeof p?.precio === 'number') {
    precio = p.precio;
  } else if (typeof p?.precio === 'string' && p.precio.trim() !== '') {
    // permitir puntos y comas, eliminar otros caracteres
    const cleaned = String(p.precio).replace(/[^\d.-]/g, '');
    const parsed = Number(cleaned);
    precio = Number.isFinite(parsed) ? parsed : null;
  } else if (typeof p?.precio_unitario === 'number') {
    precio = p.precio_unitario;
  } else {
    precio = null;
  }

  const disabled = normalizeBool(p?.disabled, false);
  const inactivo = normalizeBool(p?.inactivo, false);

  // _inactive: verdadero si deleted_at tiene valor válido o si alguno de los flags está activo
  const _inactive = Boolean(deleted_at) || disabled || inactivo;

  return {
    id,
    nombre,
    categoria_nombre,
    cantidad,
    precio,
    deleted_at,
    disabled,
    inactivo,
    _inactive,
    _raw: p
  };
};

const InventoryTab = ({ productos = [], categorias = [] }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  // Normalizar productos cada vez que cambie la prop
  const productosNormalizados = useMemo(() => {
    return (productos || []).map(normalizeProducto);
  }, [productos]);

  // Construir lista de categorías para el select
  const listaCategoriasFiltro = useMemo(() => {
    const nombresDesdeProductos = productosNormalizados.map(p => p.categoria_nombre).filter(Boolean);
    const unicas = [...new Set(nombresDesdeProductos.map(n => String(n).trim()))];
    const categoriasExtra = (categorias || [])
      .map(c => (c?.nombre ? String(c.nombre).trim() : ''))
      .filter(n => n && !unicas.includes(n));
    return ['Todas', ...unicas, ...categoriasExtra];
  }, [productosNormalizados, categorias]);

  // Filtrado principal
  const productosFiltrados = useMemo(() => {
    let filtered = [...productosNormalizados];

    // Filtrar por estado: si mostrarInactivos === true => mostrar solo inactivos,
    // si false => mostrar solo activos.
    if (mostrarInactivos) {
      filtered = filtered.filter(p => p._inactive === true);
    } else {
      filtered = filtered.filter(p => p._inactive === false);
    }

    // Filtrar por categoría si se seleccionó una distinta de 'Todas'
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

  // Preparar datos para la tabla
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
        _inactive: !!p._inactive
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