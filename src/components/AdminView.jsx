// src/components/AdminView.jsx
import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { providerService } from '../services/providerService';
import { categoryService } from '../services/categoryService';
import InventoryTab from './Admin/InventoryTab';
import AddTab from './Admin/AddTab';
import DeleteTab from './Admin/DeleteTab';
import ProvidersTab from './Admin/ProvidersTab';
import UpdateTab from './Admin/UpdateTab';

const AdminView = ({ productos, proveedores, categorias, onAddProducto, onDeleteProducto, onAddProveedor, onAddCategoria, onDeleteCategoria, onLogout }) => {
  const [vistaActiva, setVistaActiva] = useState('inventory');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleClick = (e) => {
      if (showMenu && !e.target.closest('#adminMenu') && !e.target.closest('#btnMenuHamburguesa')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showMenu]);

  // ✅ Productos
  const handleAddProductoLocal = async (producto) => {
    try {
      await productService.create(producto);
      onAddProducto();
    } catch (error) {
      console.error('Error al agregar producto:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleDeleteProductoLocal = async (id) => {
    try {
      await productService.remove(id);
      onDeleteProducto(id);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar el producto');
    }
  };

  // ✅ Actualizar producto — ¡ESTA ERA LA FALTA!
  const handleUpdateProductoLocal = async (productoActualizado) => {
    try {
      await productService.update(productoActualizado);
      onAddProducto(); // Recarga la lista completa
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      alert('Error al actualizar el producto');
    }
  };

  // ✅ Proveedores
  const handleAddProveedorLocal = async (proveedor) => {
    try {
      await providerService.create(proveedor);
      onAddProveedor();
    } catch (error) {
      console.error('Error al agregar proveedor:', error);
      alert('Error al registrar el proveedor');
    }
  };

  const handleDeleteProveedorLocal = async (id) => {
    try {
      await providerService.remove(id);
      onAddProveedor();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      alert('Error al eliminar el proveedor');
    }
  };

  // ✅ Categorías
  const handleAddCategoriaLocal = async (nombre) => {
    try {
      await categoryService.create(nombre);
      onAddCategoria();
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      alert('Error al agregar la categoría');
    }
  };

  const handleDeleteCategoriaLocal = async (id) => {
    try {
      await categoryService.remove(id);
      onDeleteCategoria(id);
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      alert('Error al eliminar la categoría');
    }
  };

  const toggleMenu = () => setShowMenu(!showMenu);
  const selectTab = (tabId) => {
    setVistaActiva(tabId);
    setShowMenu(false);
  };

  const getTitle = () => {
    switch (vistaActiva) {
      case 'inventory': return 'Inventario';
      case 'add': return 'Agregar';
      case 'update': return 'Actualizar';
      case 'delete': return 'Eliminar';
      case 'providers': return 'Proveedores';
      default: return 'Panel Administrador';
    }
  };

  return (
    <div className="card p-4">
      <h4 className="mb-3">Panel Administrador</h4>
      
      <div id="adminMobileHeader" className="d-flex align-items-center mb-3 d-md-none">
        <button id="btnMenuHamburguesa" className="btn btn-primary me-3" onClick={toggleMenu}>&#9776;</button>
        <h5 id="adminSectionTitle" className="mb-0">{getTitle()}</h5>
      </div>

      {showMenu && (
        <div id="adminMenu" className="list-group mb-3 d-md-none">
          <button className="list-group-item" onClick={() => selectTab('inventory')}>Inventario</button>
          <button className="list-group-item" onClick={() => selectTab('add')}>Agregar</button>
          <button className="list-group-item" onClick={() => selectTab('update')}>Actualizar</button>
          <button className="list-group-item" onClick={() => selectTab('delete')}>Eliminar</button>
          <button className="list-group-item" onClick={() => selectTab('providers')}>Proveedores</button>
        </div>
      )}

      <ul id="adminTabs" className="nav nav-tabs mb-3 d-none d-md-flex">
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'inventory' ? 'active' : ''}`} onClick={() => selectTab('inventory')}>Inventario</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'add' ? 'active' : ''}`} onClick={() => selectTab('add')}>Agregar</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'update' ? 'active' : ''}`} onClick={() => selectTab('update')}>Actualizar</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'delete' ? 'active' : ''}`} onClick={() => selectTab('delete')}>Eliminar</button></li>
        <li className="nav-item"><button className={`nav-link ${vistaActiva === 'providers' ? 'active' : ''}`} onClick={() => selectTab('providers')}>Proveedores</button></li>
      </ul>

      {vistaActiva === 'inventory' && <InventoryTab productos={productos} />}
      {vistaActiva === 'add' && (
        <AddTab 
          onAddProducto={handleAddProductoLocal} 
          onAddCategoria={handleAddCategoriaLocal}
          onAddProveedor={handleAddProveedorLocal}
          proveedores={proveedores || []} 
          categorias={categorias || []} 
        />
      )}
      {vistaActiva === 'update' && (
        <UpdateTab 
          productos={productos} 
          onUpdateProducto={handleUpdateProductoLocal} 
          categorias={(categorias || []).map(c => c && c.nombre ? c.nombre : c).filter(Boolean)} 
        />
      )}
      {vistaActiva === 'delete' && (
        <DeleteTab 
          productos={productos} 
          categorias={categorias || []}
          onDeleteProducto={handleDeleteProductoLocal}
          onDeleteProveedor={handleDeleteProveedorLocal}
          onDeleteCategoria={handleDeleteCategoriaLocal}
        />
      )}
      {vistaActiva === 'providers' && (
        <ProvidersTab 
          proveedores={proveedores} 
          onAddProveedor={handleAddProveedorLocal} 
        />
      )}

      <div className="text-end mt-3">
        <button onClick={onLogout} id="btnAdminBack" className="btn btn-danger">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default AdminView;