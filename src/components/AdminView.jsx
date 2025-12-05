// src/components/AdminView.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/services/supabaseClient';
import InventoryTab from './Admin/InventoryTab';
import ProvidersTab from './Admin/ProvidersTab';
import AddTab from './Admin/AddTab';
import UpdateTab from './Admin/UpdateTab';
import GestionarEstadoTab from './Admin/GestionarEstadoTab';
import UsuariosView from './UsuariosView';

/* Config de entorno */
const API_BASE = import.meta.env.VITE_API_URL || '';
const ADMIN_API_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN || ''; // temporal: en producción usa JWT por rol

/* Helpers de normalización */
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

const normalizeProducto = (p = {}) => {
  const productIdRaw = p?.product_id ?? p?.productId ?? null;
  const idRaw = p?.id ?? productIdRaw ?? '';
  const id = idRaw === null || idRaw === undefined ? '' : String(idRaw);
  const product_id = productIdRaw === null || productIdRaw === undefined ? (p?.id ? String(p.id) : '') : String(productIdRaw);

  const deleted_at_raw = p?.deleted_at ?? p?.deletedAt ?? null;
  const deleted_at = normalizeDeletedAt(deleted_at_raw);

  const nombre = p?.nombre ?? p?.name ?? p?.display_name ?? 'Sin nombre';
  // ✅ CORREGIDO: mantener valor original, no forzar "Sin Categoría"
  const categoria_nombre = p?.categoria_nombre ?? p?.categoria ?? p?.category_name ?? '';

  const cantidad = typeof p?.cantidad === 'number'
    ? p.cantidad
    : (typeof p?.stock === 'number' ? p.stock : 0);

  let precio = null;
  if (typeof p?.precio === 'number') {
    precio = p.precio;
  } else if (typeof p?.precio === 'string' && p.precio.trim() !== '') {
    const parsed = Number(String(p.precio).replace(/\D/g, ''));
    precio = Number.isFinite(parsed) ? parsed : null;
  } else if (typeof p?.precio_unitario === 'number') {
    precio = p.precio_unitario;
  } else if (typeof p?.unit_price === 'number') {
    precio = p.unit_price;
  } else {
    precio = null;
  }

  const disabled = normalizeBool(p?.disabled, false);
  const inactivo = normalizeBool(p?.inactivo, false);

  return {
    id,
    product_id,
    nombre,
    categoria_nombre, // ✅ CORREGIDO
    cantidad,
    precio,
    deleted_at,
    disabled,
    inactivo,
    _inactive: Boolean(deleted_at) || disabled || inactivo,
    _raw: p
  };
};

/* Headers para llamadas admin */
const buildAdminHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (ADMIN_API_TOKEN) headers['x-admin-token'] = ADMIN_API_TOKEN;
  try {
    const session = JSON.parse(sessionStorage.getItem('userSession') || '{}');
    if (session?.token) headers['Authorization'] = `Bearer ${session.token}`;
  } catch (err) {
    console.warn('buildAdminHeaders: no se pudo leer userSession', err);
  }
  return headers;
};

const AdminView = ({
  productos: productosProp = [],
  proveedores = [],
  categorias = [],
  vistaActiva,
  setVistaActiva,
  onAddProducto,
  onAddProveedor,
  onAddCategoria,
  onDeleteProveedor,
  onLogout,
  onUpdateSuccess
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [productos, setProductos] = useState(Array.isArray(productosProp) ? productosProp.map(normalizeProducto) : []);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuariosError, setUsuariosError] = useState('');
  const [recargarUsuariosView, setRecargarUsuariosView] = useState(0); // ✅ Nuevo estado para forzar recarga
  const fetchedUsersRef = useRef(false);

  /* Cierre de menú mobile al hacer click fuera */
  const handleClickOutside = useCallback((event) => {
    const menu = document.getElementById('adminMenu');
    const button = document.getElementById('btnMenuHamburguesa');
    if (showMenu && menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
      setShowMenu(false);
    }
  }, [showMenu]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  const toggleMenu = () => setShowMenu(!showMenu);
  const selectTab = (tabId) => { setVistaActiva(tabId); setShowMenu(false); };

  /* Sincronizar productos desde props */
  useEffect(() => {
    if (Array.isArray(productosProp) && productosProp.length > 0) {
      setProductos(productosProp.map(normalizeProducto));
    }
  }, [productosProp]);

  /**
   * fetchProductos - SIEMPRE incluye activos + inactivos
   * Valida respuesta y normaliza
   */
  const fetchProductos = useCallback(async () => {
    try {
      if (!API_BASE) {
        console.error('ADMINVIEW ERROR: VITE_API_URL no definido.');
        setProductos([]);
        return null;
      }

      // ⚠️ IMPORTANTE: Asegúrate de que el backend DEVUELVA todos los registros (incluyendo deleted_at != null)
      const url = `${API_BASE}/api/productos?_=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      const text = await res.text().catch(() => null);
      let data = null;
      try { data = JSON.parse(text); } catch (err) {
        data = null;
        console.warn('ADMINVIEW WARN: respuesta no JSON válida', err);
      }

      console.log('ADMINVIEW DEBUG: fetchProductos API raw:', text?.slice?.(0, 200) ?? text);

      const looksValid = Array.isArray(data) && data.length > 0 && (data[0]?.id || data[0]?.product_id);
      if (!res.ok || !looksValid) {
        console.error('ADMINVIEW ERROR: API productos inválida', { status: res.status, data });
        setProductos([]);
        return null;
      }

      const normalized = data.map(normalizeProducto);
      setProductos(normalized);
      console.log('ADMINVIEW DEBUG: fetchProductos (API) ->', normalized.slice(0, 5));
      return normalized;
    } catch (err) {
      console.error('fetchProductos error (API):', err);
      setProductos([]);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!productosProp || productosProp.length === 0) {
      fetchProductos();
    }
  }, [productosProp, fetchProductos]);

  /**
   * fetchUsuariosFromApi - carga usuarios con API o Supabase
   * SIEMPRE incluye activos + inactivos
   */
  const fetchUsuariosFromApi = useCallback(async () => {
    setUsuariosLoading(true);
    setUsuariosError('');
    try {
      if (API_BASE) {
        // ⚠️ Asegúrate de que /api/usuarios DEVUELVA todos los registros (activos + inactivos)
        const res = await fetch(`${API_BASE}/api/usuarios`, { headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Error al obtener usuarios desde API');
        const normalized = (data || []).map(u => ({
          id: String(u.id ?? u.user_id ?? ''),
          display_name: (u.nombres || u.apellidos)
            ? `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim()
            : (u.display_name ?? u.username ?? u.email ?? String(u.id ?? '')),
          deleted_at: normalizeDeletedAt(u.deleted_at),
          raw: u
        }));
        setUsuarios(normalized);
        fetchedUsersRef.current = true;
        setUsuariosLoading(false);
        return;
      }

      // Fallback: Supabase directo — SIN FILTRO por deleted_at
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombres, apellidos, email, username, deleted_at')
        .order('nombres', { ascending: true });

      if (error) throw error;

      const normalized = (data || []).map(u => ({
        id: String(u.id ?? u.user_id ?? ''),
        display_name: (u.nombres || u.apellidos)
          ? `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim()
          : (u.display_name ?? u.username ?? u.email ?? String(u.id ?? '')),
        deleted_at: normalizeDeletedAt(u.deleted_at),
        raw: u
      }));

      setUsuarios(normalized);
      fetchedUsersRef.current = true;
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setUsuariosError('No fue posible cargar usuarios. Revisa la tabla "usuarios", el endpoint /api/usuarios o los permisos.');
    } finally {
      setUsuariosLoading(false);
    }
  }, []);

  /**
   * toggleProducto - PATCH /api/productos/:id/disable|enable
   */
  const toggleProducto = useCallback(async (id, currentlyDisabled) => {
    try {
      if (!API_BASE) {
        console.error('toggleProducto: VITE_API_URL no definido.');
        alert('Configuración inválida: falta VITE_API_URL.');
        return false;
      }
      if (!ADMIN_API_TOKEN) {
        console.error('toggleProducto: VITE_ADMIN_API_TOKEN vacío.');
        alert('Acción admin bloqueada: falta VITE_ADMIN_API_TOKEN en el frontend.');
        return false;
      }

      const action = currentlyDisabled ? 'enable' : 'disable';
      const apiUrl = `${API_BASE}/api/productos/${encodeURIComponent(id)}/${action}`;

      // Optimismo local
      setProductos(prev => (prev || []).map(p => {
        const pid = String(p.id ?? p.product_id ?? '');
        const rawPid = String(p._raw?.product_id ?? p._raw?.id ?? '');
        if (String(pid) === String(id) || String(rawPid) === String(id)) {
          const newRaw = { ...(p._raw || {}), deleted_at: currentlyDisabled ? null : new Date().toISOString() };
          return normalizeProducto(newRaw);
        }
        return p;
      }));

      const res = await fetch(apiUrl, {
        method: 'PATCH',
        headers: buildAdminHeaders(),
        body: JSON.stringify({ reason: currentlyDisabled ? 'reactivado admin' : 'inhabilitado admin' })
      });

      const payload = await res.json().catch(() => null);
      console.log('TOGGLE PRODUCT payload:', payload, 'status:', res.status);

      if (!res.ok) {
        console.error('toggleProducto API error:', { status: res.status, payload });
        await fetchProductos(); // revertir optimismo
        alert(payload?.message || 'Error al cambiar el estado del producto (API).');
        return false;
      }

      // Actualizar según el tipo de respuesta
      if (Array.isArray(payload)) {
        const normalized = payload.map(normalizeProducto);
        setProductos(normalized);
      } else if (payload && (payload.id || payload.product_id)) {
        const returnedId = String(payload.product_id ?? payload.id ?? '');
        setProductos(prev => (prev || []).map(p => {
          const pid = String(p.id ?? p.product_id ?? '');
          const rawPid = String(p._raw?.product_id ?? p._raw?.id ?? '');
          if (String(pid) === returnedId || String(rawPid) === returnedId) {
            return normalizeProducto(payload);
          }
          return p;
        }));
      } else {
        // Respuesta inesperada: recargar
        await fetchProductos();
      }

      if (onUpdateSuccess) {
        try { await onUpdateSuccess(); } catch (err) { console.error('onUpdateSuccess error:', err); }
      }
      return true;
    } catch (err) {
      console.error('Error toggling producto (frontend):', err);
      await fetchProductos();
      alert('Ocurrió un error al cambiar el estado del producto.');
      return false;
    }
  }, [fetchProductos, onUpdateSuccess]);

  /**
   * toggleProveedor - Supabase directo
   */
  const toggleProveedor = useCallback(async (id, currentlyDisabled) => {
    try {
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      const { error } = await supabase.from('proveedores').update(payload).eq('id', id);
      if (error) throw error;
      if (onUpdateSuccess) {
        try { await onUpdateSuccess(); } catch (err) { console.error('onUpdateSuccess error:', err); }
      }
      return true;
    } catch (err) {
      console.error('Error toggling proveedor:', err);
      alert('Ocurrió un error al cambiar el estado del proveedor.');
      return false;
    }
  }, [onUpdateSuccess]);

  /**
   * toggleCategoria - Supabase directo
   */
  const toggleCategoria = useCallback(async (id, currentlyDisabled) => {
    try {
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      const { error } = await supabase.from('categorias').update(payload).eq('id', id);
      if (error) throw error;
      if (onUpdateSuccess) {
        try { await onUpdateSuccess(); } catch (err) { console.error('onUpdateSuccess error:', err); }
      }
      return true;
    } catch (err) {
      console.error('Error toggling categoria:', err);
      alert('Ocurrió un error al cambiar el estado de la categoría.');
      return false;
    }
  }, [onUpdateSuccess]);

  /**
   * toggleUsuario - API con headers admin, fallback a Supabase
   * ✅ AHORA tambien fuerza recarga en UsuariosView
   */
  const toggleUsuario = useCallback(async (userId, currentlyDisabled) => {
    // Primero intenta por API
    try {
      if (API_BASE) {
        const action = currentlyDisabled ? 'enable' : 'disable';
        const apiUrl = `${API_BASE}/api/usuarios/${encodeURIComponent(userId)}/${action}`;
        const res = await fetch(apiUrl, {
          method: 'PATCH',
          headers: buildAdminHeaders(),
          body: JSON.stringify({ reason: `cambio desde admin (${action})` })
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Error API usuarios');
        }
        fetchedUsersRef.current = false;
        await fetchUsuariosFromApi(); // ✅ Recargar usuarios globales al cambiar estado
        setRecargarUsuariosView(prev => prev + 1); // ✅ Forzar recarga en UsuariosView
        if (onUpdateSuccess) {
          try { await onUpdateSuccess(); } catch (err) { console.error('onUpdateSuccess error:', err); }
        }
        return true;
      }
    } catch (err) {
      console.warn('toggleUsuario: fallo en endpoint API, intentando fallback con supabase', err);
    }

    // Fallback directo a Supabase
    try {
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      let { error } = await supabase.from('usuarios').update(payload).eq('id', userId);
      if (error) {
        const { error: err2 } = await supabase.from('user_profiles').update(payload).eq('user_id', userId);
        if (err2) throw err2;
      }
      setUsuarios(prev => prev.map(u => (
        String(u.id) === String(userId)
          ? { ...u, deleted_at: currentlyDisabled ? null : payload.deleted_at }
          : u
      )));
      setRecargarUsuariosView(prev => prev + 1); // ✅ Forzar recarga en UsuariosView
      if (onUpdateSuccess) {
        try { await onUpdateSuccess(); } catch (err) { console.error('onUpdateSuccess error:', err); }
      }
      return true;
    } catch (err) {
      console.error('Error toggling usuario (fallback supabase):', err);
      alert('Ocurrió un error al cambiar el estado del usuario.');
      return false;
    }
  }, [fetchUsuariosFromApi, onUpdateSuccess]);

  /* Cargar usuarios al montar */
  useEffect(() => {
    if (fetchedUsersRef.current) return;
    fetchUsuariosFromApi();
  }, [fetchUsuariosFromApi]);

  return (
    <div className="card p-4 w-100">
      <h4 className="mb-3">Panel Administrador</h4>

      {/* Header mobile */}
      <div id="adminMobileHeader" className="d-flex align-items-center mb-3 d-md-none">
        <button
          id="btnMenuHamburguesa"
          className="btn btn-primary me-3"
          type="button"
          aria-label="Menú de navegación"
          onClick={toggleMenu}
        >
          &#9776;
        </button>
        <h5 id="adminSectionTitle" className="mb-0">
          {(() => {
            switch (vistaActiva) {
              case 'inventory': return 'Inventario';
              case 'providers': return 'Proveedores';
              case 'add': return 'Agregar';
              case 'update': return 'Actualizar';
              case 'delete': return 'Gestionar estado';
              case 'usuarios': return 'Usuarios';
              default: return 'Panel Administrador';
            }
          })()}
        </h5>
      </div>

      {/* Menú mobile */}
      {showMenu && (
        <div id="adminMenu" className="list-group mb-3 d-md-none" style={{ display: 'block' }}>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('inventory')}>Inventario</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('providers')}>Proveedores</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('add')}>Agregar</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('update')}>Actualizar</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('delete')}>Gestionar estado</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('usuarios')}>Usuarios</button>
        </div>
      )}

      {/* Tabs desktop */}
      <ul id="adminTabs" className="nav nav-tabs mb-3 d-none d-md-flex">
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'inventory' ? 'active' : ''}`} onClick={() => selectTab('inventory')}>Inventario</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'providers' ? 'active' : ''}`} onClick={() => selectTab('providers')}>Proveedores</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'add' ? 'active' : ''}`} onClick={() => selectTab('add')}>Agregar</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'update' ? 'active' : ''}`} onClick={() => selectTab('update')}>Actualizar</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'delete' ? 'active' : ''}`} onClick={() => selectTab('delete')}>Gestionar estado</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'usuarios' ? 'active' : ''}`} onClick={() => selectTab('usuarios')}>Usuarios</button></li>
      </ul>

      {/* Vistas */}
      {vistaActiva === 'inventory' && (
        <InventoryTab
          productos={productos}
          categorias={categorias}
          onToggleProducto={toggleProducto}
        />
      )}

      {vistaActiva === 'providers' && (
        <ProvidersTab
          proveedores={proveedores}
          onAddProveedor={onAddProveedor}
          onDeleteProveedor={onDeleteProveedor}
          onToggleProveedor={toggleProveedor}
        />
      )}

      {vistaActiva === 'add' && (
        <AddTab
          onAddProducto={onAddProducto}
          onAddCategoria={onAddCategoria}
          onAddProveedor={onAddProveedor}
          categorias={categorias}
          productos={productos}
          proveedores={proveedores}
        />
      )}

      {vistaActiva === 'update' && (
        <UpdateTab
          productos={productos}
          categorias={categorias}
          proveedores={proveedores}
          onUpdateSuccess={onUpdateSuccess}
          onUpdateProveedorSuccess={onUpdateSuccess}
        />
      )}

      {vistaActiva === 'delete' && (
        <GestionarEstadoTab
          productos={productos}
          proveedores={proveedores}
          categorias={categorias}
          usuarios={usuarios} // ✅ Lista global de usuarios (activos + inactivos)
          usuariosLoading={usuariosLoading}
          usuariosError={usuariosError}
          onToggleProducto={toggleProducto}
          onToggleProveedor={toggleProveedor}
          onToggleCategoria={toggleCategoria}
          onToggleUsuario={toggleUsuario}
          onAfterToggle={async (what) => {
            if (what === 'productos') {
              try {
                await fetchProductos();
              } catch (err) {
                console.error('onAfterToggle fetchProductos error:', err);
              }
            }
          }}
        />
      )}

      {vistaActiva === 'usuarios' && <UsuariosView key={recargarUsuariosView} />} {/* ✅ Pasa key para forzar recarga */}

      <div className="text-end mt-3">
        <button onClick={onLogout} id="btnAdminBack" className="btn btn-danger">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default AdminView;