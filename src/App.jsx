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
import { initialProductos, initialProveedores, initialCategorias } from './data/initialData';
import { filtroProductos } from './utils/helpers';
import useRealtimeSync from './hooks/useRealtimeSync';

function App() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [vistaActual, setVistaActual] = useState('login');
  const [vistaAdminActiva, setVistaAdminActiva] = useState('inventory');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Cargar datos iniciales (fetch una vez) y usar fallback si está vacío
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

  // Sincronización realtime desde el padre para productos, proveedores y categorías
  useRealtimeSync('productos', setProductos);
  useRealtimeSync('proveedores', setProveedores);
  useRealtimeSync('categorias', setCategorias);

  const handleLogin = (usr) => {
    if (!usr) {
      alert('Usuario/clave inválidos');
      return;
    }
    setUsuarioActual(usr);
    setVistaActual(usr.role === 'administrador' ? 'admin' : 'client');
    if (usr.role === 'administrador') setVistaAdminActiva('inventory');
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
    console.log("App.jsx: Renderizando vista:", vistaActual);
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
        console.log("App.jsx: Cargando AdminView con props:", { productos, categorias, vistaAdminActiva });
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
          />
        );
      default:
        return <LoginView onLogin={handleLogin} onShowRegister={handleShowRegister} onShowCatalog={handleShowCatalog} onShowForgot={() => setShowForgotModal(true)} />;
    }
  };

  // Crear producto: convierte nombre de categoría a categoria_id y usa service
  const handleAddProducto = async (nuevoProducto) => {
    try {
      const categoriaSeleccionada = categorias.find(cat => cat.nombre === nuevoProducto.categoria);

      if (!categoriaSeleccionada) {
        alert('Categoría no encontrada en la base de datos. Por favor, agréguela primero o seleccione una existente.');
        console.error("Categoría no encontrada para el nombre:", nuevoProducto.categoria);
        return;
      }

      const productoParaInsertar = {
        ...nuevoProducto,
        categoria_id: categoriaSeleccionada.id
      };

      await productService.create(productoParaInsertar);

      // Si confías en realtime no es obligatorio refrescar manualmente; de todas formas actualizar localmente por precaución
      const updated = await productService.getAll();
      setProductos(updated);
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear el producto: ' + (error.message || 'Desconocido'));
    }
  };

  const handleDeleteProducto = async (id) => {
    try {
      await productService.remove(id);
      setProductos(prev => prev.filter(p => p.id !== id));
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
      const updated = await providerService.getAll();
      setProveedores(updated);
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      alert('Error al crear el proveedor: ' + (error.message || 'Desconocido'));
    }
  };

  const handleDeleteProveedor = async (id) => {
    try {
      await providerService.remove(id);
      setProveedores(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      alert('Error al eliminar proveedor');
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