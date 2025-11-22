// src/components/AdminView.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/services/supabaseClient';
import InventoryTab from './Admin/InventoryTab';
import ProvidersTab from './Admin/ProvidersTab';
import AddTab from './Admin/AddTab';
import UpdateTab from './Admin/UpdateTab';
import GestionarEstadoTab from './Admin/GestionarEstadoTab';
import UsuariosView from './UsuariosView';

/* Helpers */
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
  // Mantener product_id explícito además de id
  const productIdRaw = p?.product_id ?? p?.productId ?? null;
  const idRaw = p?.id ?? productIdRaw ?? '';
  const id = idRaw === null || idRaw === undefined ? '' : String(idRaw);
  const product_id = productIdRaw === null || productIdRaw === undefined ? (p?.id ? String(p.id) : '') : String(productIdRaw);

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
    categoria_nombre,
    cantidad,
    precio,
    deleted_at,
    disabled,
    inactivo,
    _inactive: Boolean(deleted_at) || disabled || inactivo,
    _raw: p
  };
};

const AdminView = ({
  productos: productosProp = [],
  proveedores = [],
  categorias = [],
  vistaActiva,
  setVistaActiva,
  onAddProducto,
  onDeleteProducto,
  onAddProveedor,
  onAddCategoria,
  onDeleteCategoria,
  onDeleteProveedor,
  onLogout,
  onUpdateSuccess
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [productos, setProductos] = useState(Array.isArray(productosProp) ? productosProp.map(normalizeProducto) : []);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuariosError, setUsuariosError] = useState('');
  const fetchedUsersRef = useRef(false);

  // Evitar variable no usada en catch: usar event y usarlo en la función
  const handleClickOutside = useCallback((event) => {
    const menu = document.getElementById('adminMenu');
    const button = document.getElementById('btnMenuHamburguesa');
    if (showMenu && menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
      setShowMenu(false);
    }
  }, [showMenu]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  const toggleMenu = () => setShowMenu(!showMenu);
  const selectTab = (tabId) => { setVistaActiva(tabId); setShowMenu(false); };

  useEffect(() => {
    if (Array.isArray(productosProp) && productosProp.length > 0) {
      setProductos(productosProp.map(normalizeProducto));
    }
  }, [productosProp]);

  /**
   * fetchProductos - usa la API obligatoriamente.
   * La API debe devolver un array de productos reales (cada objeto con id o product_id).
   * Si la respuesta no es válida, se limpia la lista y se muestra error en consola.
   */
  const fetchProductos = useCallback(async () => {
    try {
      if (!import.meta.env.VITE_API_URL) {
        console.error('ADMINVIEW ERROR: VITE_API_URL no definido. La app está configurada para usar la API obligatoriamente.');
        setProductos([]);
        return null;
      }

      const url = `${import.meta.env.VITE_API_URL}/api/productos?_=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      const text = await res.text().catch(() => null);
      let data = null;
      try { data = JSON.parse(text); } catch { data = null; }

      console.log('ADMINVIEW DEBUG: fetchProductos API raw:', text?.slice?.(0, 200) ?? text);

      // Validación estricta: array y objetos con id/product_id
      const looksValid = Array.isArray(data) && data.length > 0 && (data[0]?.id || data[0]?.product_id);
      if (!res.ok || !looksValid) {
        console.error('ADMINVIEW ERROR: API productos devolvió respuesta inválida', { status: res.status, data });
        setProductos([]);
        return null;
      }

      const normalized = data.map(normalizeProducto);
      setProductos(normalized);
      console.log('ADMINVIEW DEBUG: fetchProductos (API) ->', normalized.slice(0,5));
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
   * toggleProducto - usa la API obligatoriamente para realizar el UPDATE en servidor.
   * - Hace optimismo local inmediato.
   * - Llama al endpoint PATCH /api/productos/:id/disable o /enable.
   * - Valida la respuesta y sincroniza el estado local con lo que devuelva la API.
   */
  const toggleProducto = async (id, currentlyDisabled) => {
    try {
      if (!import.meta.env.VITE_API_URL) {
        console.error('toggleProducto: VITE_API_URL no definido. La app requiere API.');
        alert('Configuración inválida: falta VITE_API_URL.');
        return false;
      }

      const action = currentlyDisabled ? 'enable' : 'disable';
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/productos/${encodeURIComponent(id)}/${action}`;

      // Optimismo local: marcar temporalmente el producto como inactivo/activo
      setProductos(prev => (prev || []).map(p => {
        const pid = String(p.id ?? p.product_id ?? '');
        const rawPid = String(p._raw?.product_id ?? p._raw?.id ?? '');
        if (String(pid) === String(id) || String(rawPid) === String(id)) {
          const newRaw = { ...(p._raw || {}), deleted_at: currentlyDisabled ? null : new Date().toISOString() };
          return normalizeProducto(newRaw);
        }
        return p;
      }));

      // Llamada al API (el servidor debe ejecutar el UPDATE en la BD con service role)
      const res = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: currentlyDisabled ? 'reactivado admin' : 'inhabilitado admin' })
      });

      const payload = await res.json().catch(() => null);

      console.log('TOGGLE PRODUCT payload:', payload, 'status:', res.status);

      if (!res.ok) {
        console.error('toggleProducto API error:', { status: res.status, payload });
        // Re-sincronizar desde API para revertir optimismo si la API falló
        await fetchProductos();
        alert(payload?.message || 'Error al cambiar el estado del producto (API).');
        return false;
      }

      // Si la API devuelve lista completa, reemplazar; si devuelve el producto, actualizar solo ese
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
        // Respuesta inesperada: forzar recarga
        await fetchProductos();
      }

      if (onUpdateSuccess) { try { await onUpdateSuccess(); } catch (err) { console.error(err); } }
      return true;
    } catch (err) {
      console.error('Error toggling producto (frontend):', err);
      // En caso de fallo, recargar para sincronizar
      await fetchProductos();
      alert('Ocurrió un error al cambiar el estado del producto.');
      return false;
    }
  };

  const toggleProveedor = async (id, currentlyDisabled) => {
    try {
      // Proveedores pueden seguir usando Supabase directo si así lo deseas,
      // pero aquí dejamos la implementación original (directa a supabase).
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      const { error } = await supabase.from('proveedores').update(payload).eq('id', id);
      if (error) throw error;
      if (onUpdateSuccess) { try { await onUpdateSuccess(); } catch (err) { console.error(err); } }
      return true;
    } catch (err) {
      console.error('Error toggling proveedor:', err);
      alert('Ocurrió un error al cambiar el estado del proveedor.');
      return false;
    }
  };

  const toggleCategoria = async (id, currentlyDisabled) => {
    try {
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      const { error } = await supabase.from('categorias').update(payload).eq('id', id);
      if (error) throw error;
      if (onUpdateSuccess) { try { await onUpdateSuccess(); } catch (err) { console.error(err); } }
      return true;
    } catch (err) {
      console.error('Error toggling categoria:', err);
      alert('Ocurrió un error al cambiar el estado de la categoría.');
      return false;
    }
  };

  const toggleUsuario = async (userId, currentlyDisabled) => {
    try {
      const action = currentlyDisabled ? 'enable' : 'disable';
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/usuarios/${encodeURIComponent(userId)}/${action}`;
      if (import.meta.env.VITE_API_URL) {
        const res = await fetch(apiUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: `cambio desde admin (${action})` })
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Error API usuarios');
        }
        fetchedUsersRef.current = false;
        await fetchUsuariosFromApi();
        if (onUpdateSuccess) { try { await onUpdateSuccess(); } catch (err) { console.error(err); } }
        return true;
      }
    } catch (err) {
      console.warn('toggleUsuario: fallo en endpoint API, intentando fallback con supabase', err);
    }
    try {
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      let { error } = await supabase.from('usuarios').update(payload).eq('id', userId);
      if (error) {
        const { error: err2 } = await supabase.from('user_profiles').update(payload).eq('user_id', userId);
        if (err2) throw err2;
      }
      setUsuarios(prev => prev.map(u => (String(u.id) === String(userId) ? { ...u, deleted_at: currentlyDisabled ? null : payload.deleted_at } : u)));
      if (onUpdateSuccess) { try { await onUpdateSuccess(); } catch (err) { console.error(err); } }
      return true;
    } catch (err) {
      console.error('Error toggling usuario (fallback supabase):', err);
      alert('Ocurrió un error al cambiar el estado del usuario.');
      return false;
    }
  };

  const fetchUsuariosFromApi = async () => {
    setUsuariosLoading(true);
    setUsuariosError('');
    try {
      if (import.meta.env.VITE_API_URL) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Error al obtener usuarios desde API');
        const normalized = (data || []).map(u => ({
          id: String(u.id ?? u.user_id ?? ''),
          display_name: (u.nombres || u.apellidos) ? `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() : (u.display_name ?? u.username ?? u.email ?? String(u.id ?? '')),
          deleted_at: normalizeDeletedAt(u.deleted_at),
          raw: u
        }));
        setUsuarios(normalized);
        fetchedUsersRef.current = true;
        setUsuariosLoading(false);
        return;
      }

      const { data, error } = await supabase.from('usuarios').select('id, nombres, apellidos, email, username, deleted_at').order('nombres', { ascending: true });
      if (error) throw error;
      const normalized = (data || []).map(u => ({
        id: String(u.id ?? u.user_id ?? ''),
        display_name: (u.nombres || u.apellidos) ? `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() : (u.display_name ?? u.username ?? u.email ?? String(u.id ?? '')),
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
  };

  useEffect(() => {
    if (fetchedUsersRef.current) return;
    fetchUsuariosFromApi();
  }, []);

  return (
    <div className="card p-4 w-100">
      <h4 className="mb-3">Panel Administrador</h4>

      <div id="adminMobileHeader" className="d-flex align-items-center mb-3 d-md-none">
        <button id="btnMenuHamburguesa" className="btn btn-primary me-3" type="button" aria-label="Menú de navegación" onClick={toggleMenu}>&#9776;</button>
        <h5 id="adminSectionTitle" className="mb-0">{(() => {
          switch (vistaActiva) {
            case 'inventory': return 'Inventario';
            case 'providers': return 'Proveedores';
            case 'add': return 'Agregar';
            case 'update': return 'Actualizar';
            case 'delete': return 'Gestionar estado';
            case 'usuarios': return 'Usuarios';
            default: return 'Panel Administrador';
          }
        })()}</h5>
      </div>

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

      <ul id="adminTabs" className="nav nav-tabs mb-3 d-none d-md-flex">
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'inventory' ? 'active' : ''}`} onClick={() => selectTab('inventory')}>Inventario</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'providers' ? 'active' : ''}`} onClick={() => selectTab('providers')}>Proveedores</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'add' ? 'active' : ''}`} onClick={() => selectTab('add')}>Agregar</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'update' ? 'active' : ''}`} onClick={() => selectTab('update')}>Actualizar</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'delete' ? 'active' : ''}`} onClick={() => selectTab('delete')}>Gestionar estado</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'usuarios' ? 'active' : ''}`} onClick={() => selectTab('usuarios')}>Usuarios</button></li>
      </ul>

      {vistaActiva === 'inventory' && <InventoryTab productos={productos} categorias={categorias} onToggleProducto={toggleProducto} />}

      {vistaActiva === 'providers' && <ProvidersTab proveedores={proveedores} onAddProveedor={onAddProveedor} onDeleteProveedor={onDeleteProveedor} onToggleProveedor={toggleProveedor} />}

      {vistaActiva === 'add' && <AddTab onAddProducto={onAddProducto} onAddCategoria={onAddCategoria} onAddProveedor={onAddProveedor} categorias={categorias} productos={productos} proveedores={proveedores} />}

      {vistaActiva === 'update' && <UpdateTab productos={productos} categorias={categorias} proveedores={proveedores} onUpdateSuccess={onUpdateSuccess} onUpdateProveedorSuccess={onUpdateSuccess} />}

      {vistaActiva === 'delete' && (
        <GestionarEstadoTab
          productos={productos}
          proveedores={proveedores}
          categorias={categorias}
          usuarios={usuarios}
          usuariosLoading={usuariosLoading}
          usuariosError={usuariosError}
          onDeleteProducto={onDeleteProducto}
          onDeleteProveedor={onDeleteProveedor}
          onDeleteCategoria={onDeleteCategoria}
          onToggleProducto={toggleProducto}
          onToggleProveedor={toggleProveedor}
          onToggleCategoria={toggleCategoria}
          onToggleUsuario={toggleUsuario}
          onAfterToggle={async (what) => { if (what === 'productos') await fetchProductos(); }}
        />
      )}

      {vistaActiva === 'usuarios' && <UsuariosView />}

      <div className="text-end mt-3">
        <button onClick={onLogout} id="btnAdminBack" className="btn btn-danger">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default AdminView;