// src/components/Admin/InventoryTab.jsx
import React, { useMemo, useState, useEffect } from 'react';
import '../ResponsiveTable.css';
import ResponsiveTable from '../ResponsiveTable';

/**
 * InventoryTab robusto
 * - Acepta productos en varias formas: normalizados (id, nombre, categoria_nombre, cantidad, precio)
 *   o raw (product_id, nombre, categoria, stock, etc).
 * - Normaliza internamente y evita placeholders.
 * - Muestra logs claros para depuración.
 */

const normalizeDeletedAt = (val) => {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return null;
  return s;
};

const normalizeBool = (val, defaultValue = false) => {
  if (val === null || val === undefined) return defaultValue;
  if (typeof val === 'boolean') return val;
  const s = String(val).trim().toLowerCase();
  return !(s === '' || s === '0' || s === 'false' || s === 'no' || s === 'null' || s === 'undefined');
};

const isPlaceholderProduct = (p) => {
  if (!p) return true;
  const nombre = String(p.nombre ?? p.name ?? p.display_name ?? '').toLowerCase();
  const id = String(p.id ?? p.product_id ?? p._raw?.product_id ?? p._raw?.id ?? '').toLowerCase();
  if (!nombre && !id) return true;
  if (nombre.includes('ejemplo') || nombre.includes('producto de ejemplo')) return true;
  if (id === 'example' || id === 'sample' || id === 'demo') return true;
  return false;
};

const buildNormalized = (p) => {
  // p puede ser ya normalizado o raw
  const raw = p?._raw ?? p ?? {};
  const idRaw = p?.id ?? p?.product_id ?? raw?.product_id ?? raw?.id ?? '';
  const id = idRaw === null || idRaw === undefined ? '' : String(idRaw);

  const nombreRaw = p?.nombre ?? p?.name ?? raw?.nombre ?? raw?.name ?? raw?.display_name ?? '';
  const nombre = nombreRaw === null || nombreRaw === undefined ? '' : String(nombreRaw);

  const categoriaRaw = p?.categoria_nombre ?? p?.categoria ?? raw?.categoria_nombre ?? raw?.categoria ?? raw?.category_name ?? '';
  const categoria_nombre = (categoriaRaw === null || categoriaRaw === undefined || String(categoriaRaw).trim() === '') ? 'Sin Categoría' : String(categoriaRaw);

  const cantidad = (typeof p?.cantidad === 'number') ? p.cantidad : (typeof raw?.cantidad === 'number' ? raw.cantidad : (typeof raw?.stock === 'number' ? raw.stock : (p?.stock ?? 0)));
  const precioRaw = p?.precio ?? raw?.precio ?? raw?.precio_unitario ?? raw?.unit_price ?? null;
  const precio = (typeof precioRaw === 'number') ? precioRaw : (precioRaw ?? null);

  const deleted_at = normalizeDeletedAt(p?.deleted_at ?? raw?.deleted_at ?? raw?.deletedAt ?? null);
  const disabled = normalizeBool(p?.disabled ?? raw?.disabled, false);
  const inactivo = normalizeBool(p?.inactivo ?? raw?.inactivo, false);

  return {
    id,
    nombre,
    categoria_nombre,
    cantidad,
    precio,
    deleted_at,
    disabled,
    inactivo,
    _inactive: Boolean(deleted_at) || disabled || inactivo,
    _raw: raw
  };
};

const InventoryTab = ({ productos = [], categorias = [], onToggleProducto }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [localProductos, setLocalProductos] = useState([]);

  // Sincronizar copia local con props (no mutamos la prop)
  useEffect(() => {
    setLocalProductos(Array.isArray(productos) ? productos : []);
  }, [productos]);

  // Logs para depuración: muestra la forma de los primeros 3 productos
  useEffect(() => {
    console.log('INVENTORY DEBUG: productos prop length =', Array.isArray(productos) ? productos.length : 'not-array');
    if (Array.isArray(productos) && productos.length > 0) {
      console.log('INVENTORY DEBUG: primeros 3 productos (raw):', productos.slice(0, 3));
    }
  }, [productos]);

  // Lista de categorías para el select (extraída de productos y del prop categorias)
  const listaCategoriasFiltro = useMemo(() => {
    const nombresDesdeProductos = (localProductos || [])
      .map(p => p?.categoria_nombre ?? p?.categoria ?? p?._raw?.categoria_nombre ?? p?._raw?.categoria ?? '')
      .filter(nombre => nombre && String(nombre).trim() !== '');

    const nombresDesdeProp = (categorias || [])
      .map(c => c?.nombre ?? c?.name ?? c?.categoria ?? c?.category_name ?? '')
      .filter(nombre => nombre && String(nombre).trim() !== '');

    const combined = [...nombresDesdeProductos, ...nombresDesdeProp];
    const unicas = [...new Set(combined.map(nombre => String(nombre).trim()))];
    return ['Todas', ...unicas];
  }, [localProductos, categorias]);

  // Normalizar todos los productos (acepta varias formas)
  const productosNormalizados = useMemo(() => {
    const arr = (localProductos || []).map(p => buildNormalized(p));
    console.log('INVENTORY DEBUG: productos normalizados (primeros 5):', arr.slice(0, 5));
    return arr;
  }, [localProductos]);

  // Filtrado: eliminar placeholders, filtrar por categoría y texto
  const productosFiltrados = useMemo(() => {
    let filtered = productosNormalizados.filter(p => !isPlaceholderProduct(p));

    if (filtroCat && filtroCat !== 'Todas') {
      const filtroCatStr = String(filtroCat).trim();
      filtered = filtered.filter(p => String(p.categoria_nombre ?? '').trim() === filtroCatStr);
    }

    if (filtroTxt && filtroTxt.trim()) {
      const term = filtroTxt.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const idStr = String(p.id ?? '');
        const nombreStr = String(p.nombre ?? '');
        const catStr = String(p.categoria_nombre ?? '');
        return idStr.toLowerCase().includes(term) || nombreStr.toLowerCase().includes(term) || catStr.toLowerCase().includes(term);
      });
    }

    console.log('INVENTORY DEBUG: productos filtrados count =', filtered.length);
    return filtered;
  }, [productosNormalizados, filtroCat, filtroTxt]);

  // Construir datos para la tabla
  const tableData = useMemo(() => {
    const data = productosFiltrados.map(p => ({
      id: p.id || '—',
      nombre: p.nombre || 'Sin nombre',
      categoriaNombre: p.categoria_nombre || 'Sin Categoría',
      cantidad: p.cantidad ?? 0,
      precio: p.precio != null ? (typeof p.precio === 'number' ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 }) : p.precio) : '—',
      _inactive: p._inactive
    }));
    console.log('INVENTORY DEBUG: tableData (primeros 5):', data.slice(0, 5));
    return data;
  }, [productosFiltrados]);

  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoriaNombre', label: 'Categoría' },
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' }
  ];

  // eslint: function intentionally starts with underscore to satisfy no-unused-vars rule when not used
  const _handleToggleFromRow = async (productId, currentlyDisabled) => {
    console.log('INVENTORY DEBUG: toggle requested for', productId, 'currentlyDisabled=', currentlyDisabled);
    if (typeof onToggleProducto === 'function') {
      const ok = await onToggleProducto(productId, currentlyDisabled);
      if (ok) {
        // actualizar localmente para respuesta inmediata
        setLocalProductos(prev => prev.map(p => {
          const norm = buildNormalized(p);
          if (String(norm.id) === String(productId)) {
            const newRaw = { ...p._raw, deleted_at: currentlyDisabled ? null : new Date().toISOString() };
            return { ...p, _raw: newRaw };
          }
          return p;
        }));
      } else {
        console.warn('INVENTORY DEBUG: onToggleProducto devolvió false para', productId);
      }
    } else {
      // si no hay onToggleProducto, solo actualizar localmente
      setLocalProductos(prev => prev.map(p => {
        const norm = buildNormalized(p);
        if (String(norm.id) === String(productId)) {
          const newRaw = { ...p._raw, deleted_at: currentlyDisabled ? null : new Date().toISOString() };
          return { ...p, _raw: newRaw };
        }
        return p;
      }));
    }
  };

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

      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
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