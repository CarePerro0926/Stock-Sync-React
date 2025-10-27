// src/components/AdminView.jsx
import React, { useState } from 'react';
import InventoryTab from './Admin/InventoryTab';
import AddTab from './Admin/AddTab';
import DeleteTab from './Admin/DeleteTab';
import ProvidersTab from './Admin/ProvidersTab';

const AdminView = ({ productos, proveedores, categorias, vistaActiva, setVistaActiva, onAddProducto, onDeleteProducto, onAddProveedor, onAddCategoria, onDeleteCategoria, onDeleteProveedor, onLogout }) => {

  const [showMenu, setShowMenu] = useState(false);

  // Cerrar menú si se hace click fuera (en móvil)
  const handleClickOutside = (event) => {
    const menu = document.getElementById('adminMenu');
    const button = document.getElementById('btnMenuHamburguesa');
    if (showMenu && menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
      setShowMenu(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const selectTab = (tabId) => {
    setVistaActiva(tabId);
    setShowMenu(false);
  };

  const getTitle = () => {
    switch (vistaActiva) {
      case 'inventory': return 'Inventario';
      case 'add': return 'Agregar';
      case 'delete': return 'Eliminar';
      case 'providers': return 'Proveedores';
      default: return 'Panel Administrador';
    }
  };

  return (
    <div className="card p-4">
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
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('add')}>Agregar</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('delete')}>Eliminar</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('providers')}>Proveedores</button>
        </div>
      )}
      <ul id="adminTabs" className="nav nav-tabs mb-3 d-none d-md-flex">
        <li className="nav-item">
          <button
            className={`nav-link ${vistaActiva === 'inventory' ? 'active' : ''}`}
            onClick={() => selectTab('inventory')}
          >
            Inventario
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${vistaActiva === 'add' ? 'active' : ''}`}
            onClick={() => selectTab('add')}
          >
            Agregar
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${vistaActiva === 'delete' ? 'active' : ''}`}
            onClick={() => selectTab('delete')}
          >
            Eliminar
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${vistaActiva === 'providers' ? 'active' : ''}`}
            onClick={() => selectTab('providers')}
          >
            Proveedores
          </button>
        </li>
      </ul>

      {console.log("AdminView: Vista activa:", vistaActiva)} {/* <-- Nuevo log */}

      {/* Renderizar la vista activa */}
      {vistaActiva === 'inventory' && (
        (() => {
          console.log("AdminView: Renderizando InventoryTab con props:", { productos, categorias, onDeleteProducto });
          return <InventoryTab productos={productos} categorias={categorias} onDeleteProducto={onDeleteProducto} />;
        })()
      )}
      {/* CORREGIDO: Pasamos todas las props necesarias */}
      {vistaActiva === 'add' && <AddTab
        onAddProducto={onAddProducto}
        onAddCategoria={onAddCategoria}
        onAddProveedor={onAddProveedor}
        categorias={categorias}
        productos={productos}
        proveedores={proveedores}
      />}
      {vistaActiva === 'delete' && <DeleteTab productos={productos} onDeleteProducto={onDeleteProducto} />}
      {vistaActiva === 'providers' && <ProvidersTab proveedores={proveedores} onAddProveedor={onAddProveedor} onDeleteProveedor={onDeleteProveedor} />}

      <div className="text-end mt-3">
        <button onClick={onLogout} id="btnAdminBack" className="btn btn-danger">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default AdminView;