// src/components/AdminView.jsx
import React, { useState, useEffect } from 'react';
import InventoryTab from './Admin/InventoryTab';
import AddTab from './Admin/AddTab';
import DeleteTab from './Admin/DeleteTab';
import ProvidersTab from './Admin/ProvidersTab';

// Añadimos 'categorias' como prop
const AdminView = ({ productos, proveedores, categorias, vistaActiva, setVistaActiva, onAddProducto, onDeleteProducto, onAddProveedor, onLogout }) => {
  // 👇 TEMPORAL: Usa datos de prueba si las props son undefined o vacías
  const mockCategorias = [
    { id: 'CAT001', nombre: 'Electrónicos' },
    { id: 'CAT002', nombre: 'Ropa' },
    { id: 'CAT003', nombre: 'Alimentos' }
  ];

  const mockProductos = [
    { id: 'PROD001', nombre: 'Laptop', categoria_id: 'CAT001', cantidad: 10, precio: 800 },
    { id: 'PROD002', nombre: 'Camiseta', categoria_id: 'CAT002', cantidad: 50, precio: 20 },
    { id: 'PROD003', nombre: 'Manzana', categoria_id: 'CAT003', cantidad: 100, precio: 1 }
  ];

  const mockProveedores = [
    { id: 'PROV001', nombre: 'Proveedor A', email: 'a@proveedor.com', telefono: '123456789' },
    { id: 'PROV002', nombre: 'Proveedor B', email: 'b@proveedor.com', telefono: '987654321' }
  ];

  // Usa los datos de prueba si las props originales están vacías o no existen
  const finalCategorias = categorias && categorias.length > 0 ? categorias : mockCategorias;
  const finalProductos = productos && productos.length > 0 ? productos : mockProductos;
  const finalProveedores = proveedores && proveedores.length > 0 ? proveedores : mockProveedores;

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
    setShowMenu(false); // Cierra el menú móvil al seleccionar una pestaña
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
      {/* Barra superior con botón de menú hamburguesa (visible en móviles) */}
      <div id="adminMobileHeader" className="d-flex align-items-center mb-3 d-md-none">
        <button
          id="btnMenuHamburguesa"
          className="btn btn-primary me-3"
          type="button"
          aria-label="Menú de navegación"
          onClick={toggleMenu}
        >
          &#9776; {/* Este es el símbolo ☰ */}
        </button>
        <h5 id="adminSectionTitle" className="mb-0">{getTitle()}</h5>
      </div>
      {/* Menú desplegable para móviles (inicialmente oculto) */}
      {showMenu && (
        <div id="adminMenu" className="list-group mb-3 d-md-none" style={{ display: 'block' }}>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('inventory')}>Inventario</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('add')}>Agregar</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('delete')}>Eliminar</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('providers')}>Proveedores</button>
        </div>
      )}
      {/* Pestañas de navegación estándar (ocultas en móviles, visibles en escritorio) */}
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

      {/* Renderizar la vista activa */}
      {vistaActiva === 'inventory' && <InventoryTab productos={finalProductos} />}
      {/* CORREGIDO: Pasamos todas las props necesarias, omitiendo onAddCategoria si no existe */}
      {vistaActiva === 'add' && <AddTab
        onAddProducto={onAddProducto}
        // onAddCategoria={...} // <-- Comenta o elimina esta línea si no tienes la función
        onAddProveedor={onAddProveedor}
        categorias={finalCategorias}
        productos={finalProductos}
        proveedores={finalProveedores}
      />}
      {vistaActiva === 'delete' && <DeleteTab onDeleteProducto={onDeleteProducto} />}
      {vistaActiva === 'providers' && <ProvidersTab proveedores={finalProveedores} onAddProveedor={onAddProveedor} />}

      <div className="text-end mt-3">
        <button onClick={onLogout} id="btnAdminBack" className="btn btn-danger">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default AdminView;