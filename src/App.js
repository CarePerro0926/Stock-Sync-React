// src/App.js
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
import { initialProductos, initialProveedores, initialCategorias } from './data/initialData';
// Importación de filtroProductos eliminada
// import { filtroProductos } from './utils/helpers';
import { supabase } from './services/supabaseClient';

function App() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carrito, setCarrito] = useState([]);
  // La variable usuarioActual se usa para gestionar la sesión
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [vistaActual, setVistaActual] = useState('login');
  const [vistaAdminActiva, setVistaAdminActiva] = useState('inventory');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Restaurar sesión desde localStorage al iniciar la app
  useEffect(() => {
    const storedSession = localStorage.getItem('userSession');
    if (storedSession) {
      try {
        const usr = JSON.parse(storedSession);
        setUsuarioActual(usr);
        setVistaActual(usr.role === 'administrador' ? 'admin' : 'client');
        if (usr.role === 'administrador') setVistaAdminActiva('inventory');
      } catch (err) {
        console.error('Error parsing userSession:', err);
        localStorage.removeItem('userSession');
      }
    }
  }, []);

  const recargarProductos = async () => {
    const data = await productService.getAll();
    setProductos(data);
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [productosDB, proveedoresDB, categoriasDB] = await Promise.all([
          productService.getAll(),
          providerService.getAll(),
          categoryService.getAll()
        ]);

        setProductos(productosDB.length > 0 ? productosDB : initialProductos);
        setProveedores(proveedoresDB.length > 0 ? proveedoresDB : initialProveedores);
        setCategorias(categoriasDB.length > 0 ? categoriasDB : initialCategorias);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setProductos(initialProductos);
        setProveedores(initialProveedores);
        setCategorias(initialCategorias);
      }
    };
    cargarDatos();
  }, []);

  // Canal realtime: productos
  useEffect(() => {
    const canalProductos = supabase
      .channel('realtime-productos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'productos' }, payload => {
        setProductos(prev => [payload.new, ...prev.filter(p => p.id !== payload.new.id)]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'productos' }, payload => {
        setProductos(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'productos' }, payload => {
        setProductos(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canalProductos);
    };
  }, []);

  // Canal realtime: proveedores
  useEffect(() => {
    const canalProveedores = supabase
      .channel('realtime-proveedores')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'proveedores' }, payload => {
        setProveedores(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'proveedores' }, payload => {
        setProveedores(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'proveedores' }, payload => {
        setProveedores(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canalProveedores);
    };
  }, []);

  const handleLogin = (usr) => {
    if (!usr) {
      alert('Usuario/clave inválidos');
      return;
    }
    try {
      localStorage.setItem('userSession', JSON.stringify(usr));
    } catch (err) {
      console.error('No se pudo guardar la sesión en localStorage:', err);
    }
    setUsuarioActual(usr);
    setVistaActual(usr.role === 'administrador' ? 'admin' : 'client');
    if (usr.role === 'administrador') setVistaAdminActiva('inventory');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('userSession');
    } catch (err) {
      console.error('No se pudo eliminar userSession:', err);
    }
    setUsuarioActual(null);
    setCarrito([]);
    setVistaActual('login');
  };

  const handleShowCatalog = () => setVistaActual('catalog');
  const handleShowRegister = () => setVistaActual('register');
  const handleShowLogin = () => setVistaActual('login');

  const renderView = () => {
    // Lectura directa de usuarioActual para satisfacer ESLint
    // Este valor no se usa para cambiar la lógica aquí, ya que vistaActual ya determina la vista
    const _usuarioActualParaESLint = usuarioActual; 

    switch (vistaActual) {
      case 'login':
        return <LoginView onLogin={handleLogin} onShowRegister={handleShowRegister} onShowCatalog={handleShowCatalog} onShowForgot={() => setShowForgotModal(true)} />;
      case 'register':
        return <RegisterView onShowLogin={handleShowLogin} />;
      case 'catalog':
        return <PublicCatalogView productos={productos} categorias={categorias} onBack={handleShowLogin} />;
      case 'client':
        return <ClientView productos={productos} categorias={categorias} carrito={carrito} setCarrito={setCarrito} onLogout={handleLogout} />;
      case 'admin':
        return (
          <AdminView
            productos={productos}
            proveedores={proveedores}
            categorias={categorias}
            vistaActiva={vistaAdminActiva}
            setVistaActiva={setVistaAdminActiva}
            onAddProducto={handleAddProducto}
            onDeleteProducto={handleDeleteProducto}
            onAddProveedor={handleAddProveedor}
            onAddCategoria={handleAddCategoria}
            onDeleteCategoria={handleDeleteCategoria}
            onDeleteProveedor={handleDeleteProveedor}
            onLogout={handleLogout}
            onUpdateSuccess={recargarProductos}
          />
        );
      default:
        return <LoginView onLogin={handleLogin} onShowRegister={handleShowRegister} onShowCatalog={handleShowCatalog} onShowForgot={() => setShowForgotModal(true)} />;
    }
  };

  const handleAddProducto = async (nuevoProducto) => {
    try {
      const categoriaSeleccionada = categorias.find(cat => cat.nombre === nuevoProducto.categoria);
      if (!categoriaSeleccionada) {
        alert('Categoría no encontrada. Agrégala primero o selecciona una existante.');
        return;
      }

      const productoParaInsertar = {
        ...nuevoProducto,
        categoria_id: categoriaSeleccionada.id
      };

      await productService.create(productoParaInsertar);
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear el producto: ' + (error.message || 'Desconocido'));
    }
  };

  const handleDeleteProducto = async (id) => {
    try {
      await productService.remove(id);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar el producto');
    }
  };

  const handleAddProveedor = async (nuevoProveedor) => {
    try {
      if (nuevoProveedor.telefono) {
        const cleaned = nuevoProveedor.telefono.replace(/\D/g, '');
        if (!(cleaned.length === 10 && cleaned.startsWith('3')) &&
            !(cleaned.length === 12 && cleaned.startsWith('573'))) {
          alert('Teléfono inválido. Usa formato colombiano: 3001234567 o +573001234567');
          return;
        }
      }

      await providerService.create(nuevoProveedor);
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      alert('Error al crear el proveedor: ' + (error.message || 'Desconocido'));
    }
  };

  const handleDeleteProveedor = async (id) => {
    try {
      await providerService.remove(id);
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      alert('Error al eliminar el proveedor');
    }
  };

  const handleAddCategoria = async (nombreCategoria) => {
    try {
      await categoryService.create({ nombre: nombreCategoria });
      const updated = await categoryService.getAll();
      setCategorias(updated);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      alert('Error al crear la categoría: ' + (error.message || 'Ya existe'));
    }
  };

  const handleDeleteCategoria = async (id) => {
    try {
      await categoryService.remove(id);
      setCategorias(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      alert('Error al eliminar la categoría');
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-center">{renderView()}</div>
      <ForgotPasswordModal show={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </div>
  );
}

export default App;