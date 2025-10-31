// src/components/AdminView.jsx
import React, { useState, useEffect } from 'react';
import InventoryTab from './Admin/InventoryTab';
import ProvidersTab from './Admin/ProvidersTab'; 
import AddTab from './Admin/AddTab';
import UpdateTab from './Admin/UpdateTab';
import DeleteTab from './Admin/DeleteTab';

/**
 * Componente principal de la vista de administrador.
 * Gestiona la navegación entre pestañas (Inventario, Proveedores, Agregar, Actualizar, Eliminar)
 * y coordina las acciones entre los subcomponentes y el estado global de la app.
 */
const AdminView = ({
  // Datos principales
  productos,
  proveedores,
  categorias,

  // Estado de navegación
  vistaActiva,
  setVistaActiva,

  // Funciones para gestionar productos
  onAddProducto,
  onDeleteProducto,

  // Funciones para gestionar proveedores
  onAddProveedor,
  onDeleteProveedor,

  // Funciones para gestionar categorías
  onAddCategoria,
  onDeleteCategoria,

  // Función para manejar el éxito de una actualización (ej. recargar datos)
  onUpdateSuccess,

  // Función para cerrar sesión
  onLogout
}) => {
  // Estado para controlar la visibilidad del menú móvil (hamburguesa)
  const [showMenu, setShowMenu] = useState(false);

  /**
   * Manejador de clics fuera del menú móvil.
   * Cierra el menú si el usuario hace clic fuera de él (en escritorio o móvil).
   */
  const handleClickOutside = (event) => {
    const menu = document.getElementById('adminMenu');
    const button = document.getElementById('btnMenuHamburguesa');
    if (showMenu && menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
      setShowMenu(false);
    }
  };

  /**
   * Efecto secundario: añade un listener global de clics al montar el componente
   * para detectar clics fuera del menú móvil y cerrarlo.
   * Se limpia al desmontar para evitar fugas de memoria.
   */
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  /**
   * Alterna la visibilidad del menú móvil (hamburguesa).
   */
  const toggleMenu = () => setShowMenu(!showMenu);

  /**
   * Cambia la pestaña activa y cierra el menú móvil (si está abierto).
   * @param {string} tabId - Identificador de la pestaña ('inventory', 'providers', etc.)
   */
  const selectTab = (tabId) => {
    setVistaActiva(tabId);
    setShowMenu(false);
  };

  /**
   * Devuelve el título correspondiente a la pestaña activa.
   * Se usa en la cabecera móvil para mostrar el nombre de la sección actual.
   */
  const getTitle = () => {
    switch (vistaActiva) {
      case 'inventory': return 'Inventario';
      case 'providers': return 'Proveedores'; 
      case 'add': return 'Agregar';
      case 'update': return 'Actualizar';
      case 'delete': return 'Eliminar';
      default: return 'Panel Administrador';
    }
  };

  return (
    <div className="card p-4">
      {/* Título principal del panel de administración */}
      <h4 className="mb-3">Panel Administrador</h4>

      {/* Encabezado móvil: muestra el botón de menú hamburguesa y el título de la sección actual */}
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

      {/* Menú móvil: lista de pestañas que se muestra solo en pantallas pequeñas */}
      {showMenu && (
        <div id="adminMenu" className="list-group mb-3 d-md-none" style={{ display: 'block' }}>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('inventory')}>Inventario</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('providers')}>Proveedores</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('add')}>Agregar</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('update')}>Actualizar</button>
          <button className="list-group-item list-group-item-action admin-menu-item" onClick={() => selectTab('delete')}>Eliminar</button>
        </div>
      )}

      {/* Pestañas de escritorio: navegación horizontal visible solo en pantallas medianas o grandes */}
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
      </ul>

      {/* Renderizado condicional de las pestañas según la vista activa */}

      {/* Pestaña: Inventario */}
      {vistaActiva === 'inventory' && (
        <InventoryTab productos={productos} categorias={categorias} onDeleteProducto={onDeleteProducto} />
      )}

      {/* Pestaña: Proveedores */}
      {vistaActiva === 'providers' && (
        <ProvidersTab proveedores={proveedores} onAddProveedor={onAddProveedor} onDeleteProveedor={onDeleteProveedor} />
      )}

      {/* Pestaña: Agregar (productos, proveedores o categorías) */}
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

      {/* Pestaña: Actualizar productos */}
      {vistaActiva === 'update' && (
        <UpdateTab
          productos={productos}
          categorias={categorias}
          onUpdateSuccess={onUpdateSuccess}
        />
      )}

      {/* Pestaña: Eliminar (productos, proveedores o categorías) */}
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

      {/* Botón cerrar sesión: permite al administrador salir de la sesión actual */}
      <div className="text-end mt-3">
        <button onClick={onLogout} id="btnAdminBack" className="btn btn-danger">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default AdminView;