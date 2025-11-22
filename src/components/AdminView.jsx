// src/components/AdminView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabaseClient';
import InventoryTab from './Admin/InventoryTab';
import ProvidersTab from './Admin/ProvidersTab';
import AddTab from './Admin/AddTab';
import UpdateTab from './Admin/UpdateTab';
import DeleteTab from './Admin/DeleteTab';
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
      case 'delete': return 'Eliminar';
      case 'usuarios': return 'Usuarios';
      default: return 'Panel Administrador';
    }
  };

  // -------------------------
  // Soft-delete toggle helpers
  // -------------------------
  // These functions set deleted_at = now() to inhabilitar,
  // or deleted_at = null to reactivar. After success they call
  // onUpdateSuccess() if provided so the parent can reload data.

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

  // If you manage users in the same DB and want soft-delete for users,
  // implement a similar toggleUsuario function and pass it to UsuariosView.

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
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('delete')}>Eliminar</button>
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
            Eliminar
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
          onToggleProducto={toggleProducto}    // <-- pasa la función de inhabilitar/reactivar
        />
      )}

      {vistaActiva === 'providers' && (
        <ProvidersTab
          proveedores={proveedores}
          onAddProveedor={onAddProveedor}
          onDeleteProveedor={onDeleteProveedor}
          onToggleProveedor={toggleProveedor} // <-- pasa la función de inhabilitar/reactivar
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
        <DeleteTab
          productos={productos}
          proveedores={proveedores}
          categorias={categorias}
          onDeleteProducto={onDeleteProducto}
          onDeleteProveedor={onDeleteProveedor}
          onDeleteCategoria={onDeleteCategoria}
          onToggleCategoria={toggleCategoria} // opcional: si quieres reusar toggle en DeleteTab
        />
      )}

      {vistaActiva === 'usuarios' && (
        <UsuariosView
          // si implementas soft-delete para usuarios, pasa aquí la función equivalente:
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