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
import { categoryService } from './services/categoryService';
import { supabase } from './services/supabaseClient';

function App() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [vistaActual, setVistaActual] = useState('loading');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // 🔑 Restaurar sesión desde Supabase Auth (persistente)
  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: perfil, error } = await supabase
          .from('usuarios')
          .select('username, role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error al obtener el perfil del usuario:', error);
          setVistaActual('login');
          return;
        }

        const usr = {
          id: session.user.id,
          email: session.user.email,
          username: perfil?.username || session.user.email.split('@')[0],
          role: perfil?.role || 'client'
        };

        setUsuarioActual(usr);
        setVistaActual(usr.role === 'admin' ? 'admin' : 'client');
      } else {
        setVistaActual('login');
      }
    };

    restoreSession();
  }, []);

  // 📦 Cargar datos del catálogo
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [productosDB, proveedoresDB, categoriasDB] = await Promise.all([
          productService.getAll(),
          providerService.getAll(),
          categoryService.getAll()
        ]);
        setProductos(productosDB);
        setProveedores(proveedoresDB);
        setCategorias(categoriasDB);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    cargarDatos();
  }, []);

  const handleLogin = (usr) => {
    setUsuarioActual(usr);
    setVistaActual(usr.role === 'admin' ? 'admin' : 'client');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsuarioActual(null);
    setCarrito([]);
    setVistaActual('login');
  };

  const handleShowCatalog = () => setVistaActual('catalog');
  const handleShowRegister = () => setVistaActual('register');
  const handleShowLogin = () => setVistaActual('login');

  const handleAddProducto = async () => {
    try {
      const updated = await productService.getAll();
      setProductos(updated);
    } catch (error) {
      console.error('Error al recargar productos:', error);
    }
  };

  const handleDeleteProducto = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddProveedor = async () => {
    try {
      const updated = await providerService.getAll();
      setProveedores(updated);
    } catch (error) {
      console.error('Error al recargar proveedores:', error);
    }
  };

  const handleAddCategoria = async () => {
    try {
      const updated = await categoryService.getAll();
      setCategorias(updated);
    } catch (error) {
      console.error('Error al recargar categorías:', error);
    }
  };

  const handleDeleteCategoria = (id) => {
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  };

  if (vistaActual === 'loading') {
    return (
      <div className="container-fluid p-4 text-center">
        Cargando sesión...
      </div>
    );
  }

  const renderView = () => {
    switch (vistaActual) {
      case 'login':
        return (
          <LoginView
            onLogin={handleLogin}
            onShowRegister={handleShowRegister}
            onShowCatalog={handleShowCatalog}
            onShowForgot={() => setShowForgotModal(true)}
          />
        );
      case 'register':
        return <RegisterView onShowLogin={handleShowLogin} />;
      case 'catalog':
        return (
          <PublicCatalogView
            productos={productos}
            onBack={handleShowLogin}
          />
        );
      case 'client':
        return (
          <ClientView
            productos={productos}
            carrito={carrito}
            setCarrito={setCarrito}
            onLogout={handleLogout}
          />
        );
      case 'admin':
        return (
          <AdminView
            productos={productos}
            proveedores={proveedores}
            categorias={categorias}
            onAddProducto={handleAddProducto}
            onDeleteProducto={handleDeleteProducto}
            onAddProveedor={handleAddProveedor}
            onAddCategoria={handleAddCategoria}
            onDeleteCategoria={handleDeleteCategoria}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <LoginView
            onLogin={handleLogin}
            onShowRegister={handleShowRegister}
            onShowCatalog={handleShowCatalog}
            onShowForgot={() => setShowForgotModal(true)}
          />
        );
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-center">{renderView()}</div>
      <ForgotPasswordModal
        show={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}

export default App;