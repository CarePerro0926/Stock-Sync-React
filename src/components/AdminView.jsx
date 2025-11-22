// src/components/AdminView.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/services/supabaseClient';
import InventoryTab from './Admin/InventoryTab';
import ProvidersTab from './Admin/ProvidersTab';
import AddTab from './Admin/AddTab';
import UpdateTab from './Admin/UpdateTab';
import GestionarEstadoTab from './Admin/GestionarEstadoTab';
import UsuariosView from './UsuariosView';
import ResponsiveTable from './ResponsiveTable';

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
    _inactive: Boolean(isDeleted) || disabled || inactivo
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

  const getTitle = () => {
    switch (vistaActiva) {
      case 'inventory': return 'Inventario';
      case 'providers': return 'Proveedores';
      case 'add': return 'Agregar';
      case 'update': return 'Actualizar';
      case 'delete': return 'Gestionar estado';
      case 'usuarios': return 'Usuarios';
      default: return 'Panel Administrador';
    }
  };

  useEffect(() => {
    if (Array.isArray(productosProp) && productosProp.length > 0) {
      setProductos(productosProp.map(normalizeProducto));
    }
  }, [productosProp]);

  const fetchProductos = useCallback(async () => {
    try {
      if (import.meta.env.VITE_API_URL) {
        // Forzar lectura fresca para evitar ETag/304 y caché
        const url = `${import.meta.env.VITE_API_URL}/api/productos?_=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-store' });
        const text = await res.text().catch(() => null);
        let data = null;
        try { data = JSON.parse(text); } catch { data = null; }
        if (res.ok && Array.isArray(data)) {
          const normalized = data.map(normalizeProducto);
          setProductos(normalized);
          return normalized;
        }
      }

      // Fallback a supabase si no hay API o falla
      const { data, error } = await supabase.from('productos').select('*').order('nombre', { ascending: true });
      if (error) throw error;
      const normalized = (data || []).map(normalizeProducto);
      setProductos(normalized);
      return normalized;
    } catch (err) {
      console.error('fetchProductos error:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!productosProp || productosProp.length === 0) {
      fetchProductos();
    }
  }, [productosProp, fetchProductos]);

  // toggleProducto: devuelve true en éxito, false en fallo
  const toggleProducto = async (id, currentlyDisabled) => {
    try {
      if (import.meta.env.VITE_API_URL) {
        const action = currentlyDisabled ? 'enable' : 'disable';
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/productos/${id}/${action}`;
        const res = await fetch(apiUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: currentlyDisabled ? 'reactivado admin' : 'inhabilitado admin' })
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          console.error('API toggleProducto error:', payload);
          alert(payload?.message || payload?.error || 'Error al cambiar el estado del producto (API).');
          return false;
        }

        // Pequeña espera para consistencia y luego forzar fetch fresco
        await new Promise(r => setTimeout(r, 250));
        const nuevos = await fetchProductos();
        // Si fetchProductos devolvió la lista, úsala para actualizar el estado
        if (Array.isArray(nuevos)) {
          setProductos(nuevos);
        }
        if (onUpdateSuccess) { try { await onUpdateSuccess(); } catch (e) { console.error(e); } }
        return true;
      }

      // Fallback supabase directo
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      const { error } = await supabase.from('productos').update(payload).eq('id', id);
      if (error) throw error;

      // Optimistic update y recarga
      const now = !currentlyDisabled ? new Date().toISOString() : null;
      setProductos(prev => prev.map(normalizeProducto).map(p => (String(p.id) === String(id) ? normalizeProducto({ ...p, deleted_at: now }) : p)));

      await new Promise(r => setTimeout(r, 150));
      const nuevos = await fetchProductos();
      if (Array.isArray(nuevos)) setProductos(nuevos);

      if (onUpdateSuccess) { try { await onUpdateSuccess(); } catch (e) { console.error(e); } }
      return true;
    } catch (err) {
      console.error('Error toggling producto:', err);
      alert('Ocurrió un error al cambiar el estado del producto.');
      return false;
    }
  };

  const toggleProveedor = async (id, currentlyDisabled) => {
    try {
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      const { error } = await supabase.from('proveedores').update(payload).eq('id', id);
      if (error) throw error;
      if (onUpdateSuccess) { try { await onUpdateSuccess(); } catch (e) { console.error(e); } }
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
      if (onUpdateSuccess) { try { await onUpdateSuccess(); } catch (e) { console.error(e); } }
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
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/usuarios/${userId}/${action}`;
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
        if (onUpdateSuccess) { try { await onUpdateSuccess(); } catch (e) { console.error(e); } }
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
      if (onUpdateSuccess) { try { await onUpdateSuccess(); } catch (e) { console.error(e); } }
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
        <h5 id="adminSectionTitle" className="mb-0">{getTitle()}</h5>
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