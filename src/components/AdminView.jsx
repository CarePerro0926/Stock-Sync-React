// src/components/AdminView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabaseClient';
import InventoryTab from './Admin/InventoryTab';
import ProvidersTab from './Admin/ProvidersTab';
import AddTab from './Admin/AddTab';
import UpdateTab from './Admin/UpdateTab';
import DeleteTab from './Admin/GestionarEstadoTabTab';
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
      case 'delete': return 'Gestionar estado';
      case 'usuarios': return 'Usuarios';
      default: return 'Panel Administrador';
    }
  };

  // -------------------------
  // Funciones auxiliares para activar/desactivar el borrado lógico
  // -------------------------
  // Estas funciones establecen deleted_at = now() para deshabilitar,
  // or deleted_at = null para reactivar. Tras la operación, llaman a
  // onUpdateSuccess() si se proporciona, para que el proceso padre pueda recargar los datos.

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

  // Si se implementa soft-delete para usuarios, se descomenta e implementa toggleUsuario
  /*
  const toggleUsuario = async (userId, currentlyDisabled) => {
    try {
      // ejemplo: actualizar user_profiles.deleted_at
      const payload = currentlyDisabled ? { deleted_at: null } : { deleted_at: new Date().toISOString() };
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: userId, deleted_at: payload.deleted_at }, { onConflict: 'user_id' });

      if (error) throw error;
      if (onUpdateSuccess) {
        try { await onUpdateSuccess(); } catch (e) { console.error(e); }
      }
    } catch (err) {
      console.error('Error toggling usuario:', err);
      alert('Ocurrió un error al cambiar el estado del usuario.');
    }
  };
  */

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
          // compatibilidad: DeleteTab acepta onDeleteX (legacy) o onToggleX (nuevo)
          onDeleteProducto={onDeleteProducto}
          onDeleteProveedor={onDeleteProveedor}
          onDeleteCategoria={onDeleteCategoria}
          onToggleProducto={toggleProducto}
          onToggleProveedor={toggleProveedor}
          onToggleCategoria={toggleCategoria}
        />
      )}

      {vistaActiva === 'usuarios' && (
        <UsuariosView
          // si se implementa soft-delete para usuarios, pasa aquí la función equivalente:
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