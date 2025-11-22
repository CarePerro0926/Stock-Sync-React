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

const AdminView = ({
  productos,
  proveedores,
  categorias,
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

  // usuarios (se cargan si no se pasan desde el padre)
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
  const selectTab = (tabId) => {
    setVistaActiva(tabId);
    setShowMenu(false);
  };

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

  // -------------------------
  // Funciones auxiliares para activar/desactivar el borrado lógico
  // -------------------------
  const toggleProducto = async (id, currentlyDisabled) => {
    try {
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      const { error } = await supabase
        .from('productos')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      if (onUpdateSuccess) {
        try { await onUpdateSuccess(); } catch (e) { console.error(e); }
      }
    } catch (err) {
      console.error('Error toggling producto:', err);
      alert('Ocurrió un error al cambiar el estado del producto.');
    }
  };

  const toggleProveedor = async (id, currentlyDisabled) => {
    try {
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      const { error } = await supabase
        .from('proveedores')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      if (onUpdateSuccess) {
        try { await onUpdateSuccess(); } catch (e) { console.error(e); }
      }
    } catch (err) {
      console.error('Error toggling proveedor:', err);
      alert('Ocurrió un error al cambiar el estado del proveedor.');
    }
  };

  const toggleCategoria = async (id, currentlyDisabled) => {
    try {
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      const { error } = await supabase
        .from('categorias')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      if (onUpdateSuccess) {
        try { await onUpdateSuccess(); } catch (e) { console.error(e); }
      }
    } catch (err) {
      console.error('Error toggling categoria:', err);
      alert('Ocurrió un error al cambiar el estado de la categoría.');
    }
  };

  // toggleUsuario: soft-delete en la tabla correcta usando id
  const toggleUsuario = async (userId, currentlyDisabled) => {
    try {
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      // Actualizar en la tabla "usuarios" (la que contiene todos los registros)
      const { error } = await supabase
        .from('usuarios') // usar 'usuarios' si esa es la tabla principal
        .update(payload)
        .eq('id', userId);

      if (error) throw error;
      if (onUpdateSuccess) {
        try { await onUpdateSuccess(); } catch (e) { console.error(e); }
      }
      // actualizar lista localmente para reflejar cambio inmediato
      setUsuarios(prev => prev.map(u => (String(u.id) === String(userId) ? { ...u, deleted_at: currentlyDisabled ? null : payload.deleted_at } : u)));
    } catch (err) {
      console.error('Error toggling usuario:', err);
      alert('Ocurrió un error al cambiar el estado del usuario.');
    }
  };

  // -------------------------
  // Cargar usuarios si es necesario (si no se pasan desde el padre)
  // -------------------------
  useEffect(() => {
    let mounted = true;

    // si ya hicimos fetch, no volver a hacerlo
    if (fetchedUsersRef.current) return () => { mounted = false; };

    const fetchUsuarios = async () => {
      setUsuariosLoading(true);
      setUsuariosError('');
      try {
        // Leer desde la tabla "usuarios" que contiene todos los registros
        const { data, error } = await supabase
          .from('usuarios') // <- tabla correcta con nombres/apellidos
          .select('id, nombres, apellidos, email, username, deleted_at')
          .order('nombres', { ascending: true });

        if (error) throw error;
        if (!mounted) return;

        // Normalizamos la respuesta para usar siempre id y display_name
        const normalized = (data || []).map(u => ({
          id: String(u.id ?? u.user_id ?? ''),
          display_name: (u.nombres || u.apellidos)
            ? `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim()
            : (u.display_name ?? u.username ?? u.email ?? String(u.id ?? '')),
          deleted_at: u.deleted_at ?? null,
          raw: u
        }));
        setUsuarios(normalized);
        fetchedUsersRef.current = true;
      } catch (err) {
        console.error('Error cargando usuarios:', err);
        setUsuariosError('No fue posible cargar usuarios. Revisa la tabla "usuarios" o los permisos.');
      } finally {
        if (mounted) setUsuariosLoading(false);
      }
    };

    fetchUsuarios();

    return () => { mounted = false; };
  }, []); // efecto solo al montar

  return (
    <div className="card p-4 w-100">
      <h4 className="mb-3">Panel Administrador</h4>

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
        <li className="nav-item">
          <button className={`nav-link ${vistaActiva === 'inventory' ? 'active' : ''}`} onClick={() => selectTab('inventory')}>
            Inventario
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${vistaActiva === 'providers' ? 'active' : ''}`} onClick={() => selectTab('providers')}>
            Proveedores
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${vistaActiva === 'add' ? 'active' : ''}`} onClick={() => selectTab('add')}>
            Agregar
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${vistaActiva === 'update' ? 'active' : ''}`} onClick={() => selectTab('update')}>
            Actualizar
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${vistaActiva === 'delete' ? 'active' : ''}`} onClick={() => selectTab('delete')}>
            Gestionar estado
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${vistaActiva === 'usuarios' ? 'active' : ''}`} onClick={() => selectTab('usuarios')}>
            Usuarios
          </button>
        </li>
      </ul>

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
        />
      )}

      {vistaActiva === 'usuarios' && (
        <UsuariosView
          // si implementas soft-delete para usuarios, puedes pasar onToggleUsuario aquí también
          // onToggleUsuario={toggleUsuario}
        />
      )}

      <div className="text-end mt-3">
        <button onClick={onLogout} id="btnAdminBack" className="btn btn-danger">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default AdminView;