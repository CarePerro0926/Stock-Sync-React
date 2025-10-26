// src/components/AdminView.js
import React, { useState, useEffect } from 'react';
import InventoryTab from './Admin/InventoryTab';
import AddTab from './Admin/AddTab';
import DeleteTab from './Admin/DeleteTab';
import ProvidersTab from './Admin/ProvidersTab';
import CategoriesTab from './Admin/CategoriesTab'; // Nuevo: gestión de categorías

const AdminView = ({
  productos,
  categorias,
  proveedores,
  vistaActiva,
  setVistaActiva,
  onAddProducto,
  onDeleteProducto,
  onAddProveedor,
  onAddCategoria, // Nueva función
  onLogout
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Cerrar menú si se hace click fuera (en móvil)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menu = document.getElementById('adminMenu');
      const button = document.getElementById('btnMenuHamburguesa');
      if (showMenu && menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
        setShowMenu(false);
      }
    };

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
      case 'add': return 'Agregar Producto';
      case 'categorias': return 'Categorías';
      case 'providers': return 'Proveedores';
      case 'delete': return 'Eliminar';
      default: return 'Panel Administrador';
    }
  };

  return (
    <div className="card p-4">
      <h4 className="mb-3">Panel Administrador</h4>

      {/* Barra superior móvil */}
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

      {/* Menú móvil */}
      {showMenu && (
        <div id="adminMenu" className="list-group mb-3 d-md-none">
          <button className="list-group-item list-group-item-action" onClick={() => selectTab('inventory')}>Inventario</button>
          <button className="list-group-item list-group-item-action" onClick={() => selectTab('add')}>Agregar Producto</button>
          <button className="list-group-item list-group-item-action" onClick={() => selectTab('categorias')}>Categorías</button>
          <button className="list-group-item list-group-item-action" onClick={() => selectTab('providers')}>Proveedores</button>
          <button className="list-group-item list-group-item-action" onClick={() => selectTab('delete')}>Eliminar</button>
        </div>
      )}

      {/* Pestañas escritorio */}
      <ul id="adminTabs" className="nav nav-tabs mb-3 d-none d-md-flex">
        <li className="nav-item">
          <button className={`nav-link ${vistaActiva === 'inventory' ? 'active' : ''}`} onClick={() => selectTab('inventory')}>
            Inventario
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${vistaActiva === 'add' ? 'active' : ''}`} onClick={() => selectTab('add')}>
            Agregar Producto
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${vistaActiva === 'categorias' ? 'active' : ''}`} onClick={() => selectTab('categorias')}>
            Categorías
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${vistaActiva === 'providers' ? 'active' : ''}`} onClick={() => selectTab('providers')}>
            Proveedores
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${vistaActiva === 'delete' ? 'active' : ''}`} onClick={() => selectTab('delete')}>
            Eliminar
          </button>
        </li>
      </ul>

      {/* Contenido dinámico */}
      {vistaActiva === 'inventory' && <InventoryTab productos={productos} categorias={categorias} proveedores={proveedores} />}
      {vistaActiva === 'add' && <AddTab onAddProducto={onAddProducto} categorias={categorias} proveedores={proveedores} />}
      {vistaActiva === 'delete' && <DeleteTab onDeleteProducto={onDeleteProducto} />}
      {vistaActiva === 'providers' && <ProvidersTab proveedores={proveedores} onAddProveedor={onAddProveedor} />}
      {vistaActiva === 'categorias' && <CategoriesTab categorias={categorias} onAddCategoria={onAddCategoria} />}

      <div className="text-end mt-3">
        <button onClick={onLogout} id="btnAdminBack" className="btn btn-danger">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default AdminView;