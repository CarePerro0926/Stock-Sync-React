// src/App.jsx
import React, { useState, useEffect } from 'react';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import PublicCatalogView from './components/PublicCatalogView';
import ClientView from './components/ClientView';
import AdminView from './components/AdminView';
import ForgotPasswordModal from './components/Modals/ForgotPasswordModal';
import { productService } from './services/productService';
import { providerService } from './services/providerService';
import { categoryService } from './services/categoryService'; // ✅ Nuevo

function App() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]); // ✅ Nuevo
  const [carrito, setCarrito] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [vistaActual, setVistaActual] = useState('login');
  const [vistaAdminActiva, setVistaAdminActiva] = useState('inventory');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [productosDB, proveedoresDB, categoriasDB] = await Promise.all([
          productService.getAll(),
          providerService.getAll(),
          categoryService.getAll() // ✅ Nuevo
        ]);
        setProductos(productosDB);
        setProveedores(proveedoresDB);
        setCategorias(categoriasDB); // ✅ Nuevo
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    cargarDatos();
  }, []);

  const handleLogin = (usr) => {
    if (!usr) {
      alert('Usuario/clave inválidos');
      return;
    }
    setUsuarioActual(usr);
    setVistaActual(usr.role === 'admin' ? 'admin' : 'client');
    if (usr.role === 'admin') setVistaAdminActiva('inventory');
  };

  const handleLogout = () => {
    setUsuarioActual(null);
    setCarrito([]);
    setVistaActual('login');
  };

  const handleShowCatalog = () => setVistaActual('catalog');
  const handleShowRegister = () => setVistaActual('register');
  const handleShowLogin = () => setVistaActual('login');

  const renderView = () => {
    switch (vistaActual) {
      case 'login':
        return <LoginView onLogin={handleLogin} onShowRegister={handleShowRegister} onShowCatalog={handleShowCatalog} onShowForgot={() => setShowForgotModal(true)} />;
      case 'register':
        return <RegisterView onShowLogin={handleShowLogin} />;
      case 'catalog':
        return <PublicCatalogView productos={productos} onBack={handleShowLogin} />;
      case 'client':
        return <ClientView productos={productos} carrito={carrito} setCarrito={setCarrito} onLogout={handleLogout} />;
      case 'admin':
        return (
          <AdminView
            productos={productos}
            proveedores={proveedores}
            categorias={categorias} // ✅ Nuevo
            onAddProducto={handleAddProducto}
            onDeleteProducto={handleDeleteProducto}
            onAddProveedor={handleAddProveedor}
            onAddCategoria={handleAddCategoria} // ✅ Nuevo
            onDeleteCategoria={handleDeleteCategoria} // ✅ Nuevo
            onLogout={handleLogout}
          />
        );
      default:
        return <LoginView onLogin={handleLogin} onShowRegister={handleShowRegister} onShowCatalog={handleShowCatalog} onShowForgot={() => setShowForgotModal(true)} />;
    }
  };

  // Productos
  const handleAddProducto = async () => {
    try {
      const updated = await productService.getAll();
      setProductos(updated);
    } catch (error) {
      console.error('Error al recargar productos:', error);
    }
  };

  const handleDeleteProducto = (id) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  // Proveedores
  const handleAddProveedor = async () => {
    try {
      const updated = await providerService.getAll();
      setProveedores(updated);
    } catch (error) {
      console.error('Error al recargar proveedores:', error);
    }
  };

  // ✅ Categorías
  const handleAddCategoria = async () => {
    try {
      const updated = await categoryService.getAll();
      setCategorias(updated);
    } catch (error) {
      console.error('Error al recargar categorías:', error);
    }
  };

  const handleDeleteCategoria = (id) => {
    setCategorias(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-center">{renderView()}</div>
      <ForgotPasswordModal show={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </div>
  );
}

export default App;