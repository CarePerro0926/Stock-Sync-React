import React, { useState, useEffect, useCallback } from 'react';
import InventoryTab from './Admin/InventoryTab';
import ProvidersTab from './Admin/ProvidersTab'; 
import AddTab from './Admin/AddTab';
import UpdateTab from './Admin/UpdateTab';
import DeleteTab from './Admin/DeleteTab';
import UsuariosView from './UsuariosView'; //  Importación nueva
import './ResponsiveTable.css'; // Mantiene el modo tarjeta

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
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('usuarios')}>Usuarios</button> {/* ✅ Nueva opción */}
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
        </li> {/* ✅ Nueva pestaña */}
      </ul>

      {vistaActiva === 'inventory' && (
        <InventoryTab productos={productos} categorias={categorias} onDeleteProducto={onDeleteProducto} />
      )}
      {vistaActiva === 'providers' && (
        <ProvidersTab proveedores={proveedores} onAddProveedor={onAddProveedor} onDeleteProveedor={onDeleteProveedor} />
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
          onUpdateSuccess={onUpdateSuccess}
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
        />
      )}
      {vistaActiva === 'usuarios' && (
        <UsuariosView /> // ✅ Renderiza la tabla de usuarios
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