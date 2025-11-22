// src/components/Admin/InventoryTab.jsx
import React, { useMemo, useState, useEffect } from 'react';

/**
 * InventoryTab corregido:
 * - Normaliza productos defensivamente (id, deleted_at, flags)
 * - Filtra explícitamente por activos/inactivos
 * - No muestra "producto de ejemplo"; muestra mensaje claro cuando no hay datos
 * - Llama a onToggleProducto (si se pasa) y espera su resultado
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

const InventoryTab = ({ productos = [], categorias = [], onToggleProducto }) => {
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [localProductos, setLocalProductos] = useState([]);

  // Mantener copia local sincronizada con props (pero no reemplazar si el usuario está interactuando)
  useEffect(() => {
    setLocalProductos(Array.isArray(productos) ? productos : []);
  }, [productos]);

  // Normalización defensiva
  const productosNormalizados = useMemo(() => {
    return (localProductos || []).map(p => {
      const deleted_at_raw = p.deleted_at ?? p._raw?.deleted_at ?? p._raw?.deletedAt ?? null;
      const deleted_at = normalizeDeletedAt(deleted_at_raw);
      const disabled = normalizeBool(p.disabled, false);
      const inactivo = normalizeBool(p.inactivo, false);
      const id = String(p.id ?? p.product_id ?? (p._raw && (p._raw.product_id ?? p._raw.id)) ?? '');
      const nombre = p.nombre ?? p._raw?.nombre ?? p._raw?.name ?? '';
      const categoria_nombre = p.categoria_nombre ?? p._raw?.categoria_nombre ?? p._raw?.categoria ?? '';
      return {
        ...p,
        id,
        nombre,
        categoria_nombre,
        deleted_at: (deleted_at === '' || deleted_at?.toLowerCase() === 'null' || deleted_at?.toLowerCase() === 'undefined') ? null : deleted_at,
        disabled,
        inactivo,
        _inactive: Boolean(deleted_at) || disabled || inactivo
      };
    });
  }, [localProductos]);

  // Filtrado explícito
  const productosFiltrados = useMemo(() => {
    let filtered = [...productosNormalizados];

    if (mostrarInactivos) {
      filtered = filtered.filter(p => p._inactive === true);
    } else {
      filtered = filtered.filter(p => p._inactive === false);
    }

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

    return filtered;
  }, [productosNormalizados, mostrarInactivos, filtroCat, filtroTxt]);

  // Handler para toggle desde la tabla (llama al padre si existe)
  const handleToggleFromRow = async (productId, currentlyDisabled) => {
    if (typeof onToggleProducto === 'function') {
      const ok = await onToggleProducto(productId, currentlyDisabled);
      if (ok) {
        // actualizar localmente para respuesta inmediata
        setLocalProductos(prev => prev.map(p => (String(p.id) === String(productId) ? { ...p, deleted_at: currentlyDisabled ? null : new Date().toISOString() } : p)));
      } else {
        // si falla, no cambiar localmente
        console.warn('onToggleProducto devolvió false para', productId);
      }
    } else {
      // Si no hay onToggleProducto, solo actualizar localmente (no recomendado para persistencia)
      setLocalProductos(prev => prev.map(p => (String(p.id) === String(productId) ? { ...p, deleted_at: currentlyDisabled ? null : new Date().toISOString() } : p)));
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <div className="me-3">
          <label className="form-check-label me-2">Mostrar inactivos</label>
          <input type="checkbox" checked={mostrarInactivos} onChange={(e) => setMostrarInactivos(e.target.checked)} />
        </div>

        <div className="me-3">
          <select className="form-select" value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}>
            <option value="Todas">Todas</option>
            {(categorias || []).map(c => <option key={c.id} value={c.nombre ?? c.name ?? c.id}>{c.nombre ?? c.name ?? c.id}</option>)}
          </select>
        </div>

        <div className="flex-grow-1">
          <input className="form-control" placeholder="Buscar por id, nombre o categoría" value={filtroTxt} onChange={(e) => setFiltroTxt(e.target.value)} />
        </div>
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="p-3 text-muted">No hay productos para mostrar con los filtros actuales.</div>
      ) : (
        <div className="row g-3">
          {productosFiltrados.map(p => (
            <div key={p.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title mb-1">{p.nombre || 'Sin nombre'}</h6>
                  <p className="card-text mb-1"><strong>ID:</strong> {p.id}</p>
                  <p className="card-text mb-1"><strong>Categoría:</strong> {p.categoria_nombre}</p>
                  <p className="card-text mb-2"><strong>Stock:</strong> {p.cantidad ?? '-'}</p>
                  <div className="mt-auto d-flex gap-2">
                    <button
                      className={`btn ${p._inactive ? 'btn-success' : 'btn-warning'} btn-sm flex-grow-1`}
                      onClick={() => handleToggleFromRow(p.id, p._inactive)}
                    >
                      {p._inactive ? 'Reactivar' : 'Inhabilitar'}
                    </button>
                    <button className="btn btn-outline-secondary btn-sm">Editar</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryTab;