// src/components/Admin/InventoryTab.jsx
import React, { useMemo, useState, useEffect } from 'react';
import '../ResponsiveTable.css';
import ResponsiveTable from '../ResponsiveTable';

// Si usas Supabase Auth helpers en el frontend, mantenlos; si no, el componente
// intentará detectar el usuario vía supabase-js si tienes el cliente disponible.
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

/* ------------------ Helpers de normalización ------------------ */

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
  const raw = p?._raw ?? p ?? {};
  const idRaw = p?.id ?? p?.product_id ?? raw?.product_id ?? raw?.id ?? '';
  const id = idRaw === null || idRaw === undefined ? '' : String(idRaw);

  const nombreRaw = p?.nombre ?? p?.name ?? raw?.nombre ?? raw?.name ?? raw?.display_name ?? '';
  const nombre = nombreRaw === null || nombreRaw === undefined ? '' : String(nombreRaw);

  const categoriaRaw = p?.categoria_nombre ?? p?.categoria ?? raw?.categoria_nombre ?? raw?.categoria ?? raw?.category_name ?? '';
  const categoria_nombre = (categoriaRaw === null || categoriaRaw === undefined || String(categoriaRaw).trim() === '') ? 'Sin Categoría' : String(categoriaRaw);

  const cantidad = (typeof p?.cantidad === 'number') ? p.cantidad
    : (typeof raw?.cantidad === 'number' ? raw.cantidad
      : (typeof raw?.stock === 'number' ? raw.stock : (p?.stock ?? 0)));

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

/* ------------------ Componente principal ------------------ */

const InventoryTab = ({ productos = [], categorias = [], onToggleProducto, isAdmin: isAdminProp = undefined }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [localProductos, setLocalProductos] = useState([]);
  const [showInactive, setShowInactive] = useState(false);

  // Supabase hooks (si están disponibles en tu proyecto)
  const user = useUser?.();
  const supabase = useSupabaseClient?.();

  // Estado local que decide si el usuario es admin
  const [isAdminLocal, setIsAdminLocal] = useState(Boolean(isAdminProp === true));

  useEffect(() => {
    setLocalProductos(Array.isArray(productos) ? productos : []);
  }, [productos]);

  // Detección de rol: prioridad
  // 1) Prop isAdmin pasada por el padre (boolean)
  // 2) useUser hook (user metadata / role)
  // 3) supabase.auth.getUser() fallback si supabase client está disponible
  useEffect(() => {
    let mounted = true;

    if (typeof isAdminProp === 'boolean') {
      setIsAdminLocal(isAdminProp);
      return () => { mounted = false; };
    }

    const detect = async () => {
      try {
        // 1) useUser hook
        if (user) {
          const role = user?.user_metadata?.role ?? user?.role ?? user?.app_metadata?.role ?? null;
          if (String(role).toLowerCase() === 'admin') {
            if (mounted) setIsAdminLocal(true);
            return;
          }
        }

        // 2) supabase client fallback
        if (supabase && typeof supabase.auth?.getUser === 'function') {
          const { data, error } = await supabase.auth.getUser();
          if (!error && data?.user) {
            const u = data.user;
            const role = u?.user_metadata?.role ?? u?.role ?? u?.app_metadata?.role ?? null;
            if (String(role).toLowerCase() === 'admin') {
              if (mounted) setIsAdminLocal(true);
              return;
            }
          }
        }

        // default false
        if (mounted) setIsAdminLocal(false);
      } catch (err) {
        console.warn('INVENTORY DEBUG: error detectando rol admin', err);
        if (mounted) setIsAdminLocal(false);
      }
    };

    detect();
    return () => { mounted = false; };
  }, [isAdminProp, user, supabase]);

  useEffect(() => {
    console.log('INVENTORY DEBUG: isAdminProp=', isAdminProp, 'isAdminLocal=', isAdminLocal, 'showInactive=', showInactive);
  }, [isAdminProp, isAdminLocal, showInactive]);

  /* ------------------ Lista de categorías (filtro) ------------------ */
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

  /* ------------------ Normalización de productos ------------------ */
  const productosNormalizados = useMemo(() => {
    const arr = (localProductos || []).map(p => buildNormalized(p));
    console.log('INVENTORY DEBUG: productos normalizados (primeros 5):', arr.slice(0, 5));
    return arr;
  }, [localProductos]);

  /* ------------------ Búsqueda / filtrado ------------------ */
  const extractIdFromSearch = (raw) => {
    if (!raw) return null;
    const trimmed = String(raw).trim();
    if (trimmed.includes(' - ')) {
      const maybeId = trimmed.split(' - ')[0].trim();
      if (maybeId !== '') return maybeId;
    }
    if (/^\d+$/.test(trimmed)) return trimmed;
    if (/^[0-9a-fA-F-]{8,}$/.test(trimmed)) return trimmed;
    return null;
  };

  const productosFiltrados = useMemo(() => {
    let filtered = productosNormalizados
      .filter(p => !isPlaceholderProduct(p))
      .filter(p => {
        // si no queremos ver inactivos, excluirlos
        if (!showInactive) return !p._inactive;
        return true;
      });

    if (filtroCat && filtroCat !== 'Todas') {
      const filtroCatStr = String(filtroCat).trim();
      filtered = filtered.filter(p => String(p.categoria_nombre ?? '').trim() === filtroCatStr);
    }

    const rawSearch = String(filtroTxt ?? '').trim();
    if (!rawSearch) {
      console.log('INVENTORY DEBUG: productos filtrados count =', filtered.length);
      return filtered;
    }

    const explicitId = extractIdFromSearch(rawSearch);
    if (explicitId !== null) {
      filtered = filtered.filter(p => String(p.id ?? '').trim() === String(explicitId).trim());
      console.log('INVENTORY DEBUG: búsqueda por ID explícito =', explicitId, 'resultados =', filtered.length);
      return filtered;
    }

    const term = rawSearch.toLowerCase();
    filtered = filtered.filter(p => {
      const idStr = String(p.id ?? '').toLowerCase();
      const nombreStr = String(p.nombre ?? '').toLowerCase();
      const catStr = String(p.categoria_nombre ?? '').toLowerCase();
      return idStr.includes(term) || nombreStr.includes(term) || catStr.includes(term);
    });

    console.log('INVENTORY DEBUG: productos filtrados count =', filtered.length);
    return filtered;
  }, [productosNormalizados, filtroCat, filtroTxt, showInactive]);

  /* ------------------ Datos para la tabla ------------------ */
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

  /* ------------------ Toggle desde fila (mantener compatibilidad) ------------------ */
  const _handleToggleFromRow = async (productId, currentlyDisabled) => {
    console.log('INVENTORY DEBUG: toggle requested for', productId, 'currentlyDisabled=', currentlyDisabled);
    if (typeof onToggleProducto === 'function') {
      const ok = await onToggleProducto(productId, currentlyDisabled);
      if (ok) {
        setLocalProductos(prev => prev.map(p => {
          const norm = buildNormalized(p);
          const rawProductId = String(p._raw?.product_id ?? p._raw?.id ?? '');
          if (String(norm.id) === String(productId) || rawProductId === String(productId)) {
            const newRaw = { ...p._raw, deleted_at: currentlyDisabled ? null : new Date().toISOString() };
            return { ...p, _raw: newRaw };
          }
          return p;
        }));
      } else {
        console.warn('INVENTORY DEBUG: onToggleProducto devolvió false para', productId);
      }
    } else {
      setLocalProductos(prev => prev.map(p => {
        const norm = buildNormalized(p);
        const rawProductId = String(p._raw?.product_id ?? p._raw?.id ?? '');
        if (String(norm.id) === String(productId) || rawProductId === String(productId)) {
          const newRaw = { ...p._raw, deleted_at: currentlyDisabled ? null : new Date().toISOString() };
          return { ...p, _raw: newRaw };
        }
        return p;
      }));
    }
  };

  /* ------------------ Render ------------------ */
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

        {/* Checkbox: visible siempre; habilitado solo si isAdminLocal === true */}
        <div className="col-auto d-flex align-items-center">
          <label className="form-check-label me-2" htmlFor="showInactiveCheckbox">Mostrar inactivos</label>
          <input
            id="showInactiveCheckbox"
            type="checkbox"
            className="form-check-input"
            checked={showInactive}
            onChange={e => setShowInactive(e.target.checked)}
            disabled={!isAdminLocal}
            aria-disabled={!isAdminLocal}
          />
          {!isAdminLocal && (
            <small className="text-muted ms-2">
              (solo editable para administradores)
            </small>
          )}
        </div>
      </div>

      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        <div className="table-responsive">
          <ResponsiveTable
            headers={tableHeaders}
            data={tableData}
            // onRowToggle={_handleToggleFromRow} // descomenta si tu ResponsiveTable soporta toggle
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;