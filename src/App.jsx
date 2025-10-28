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

function App() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
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
          categoryService.getAll()
        ]);

        // Si los servicios devuelven vacío, usar datos iniciales
        setProductos(productosDB.length > 0 ? productosDB : initialProductos);
        setProveedores(proveedoresDB.length > 0 ? proveedoresDB : initialProveedores);
        setCategorias(categoriasDB.length > 0 ? categoriasDB : initialCategorias);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        // En caso de error, usar datos iniciales
        setProductos(initialProductos);
        setProveedores(initialProveedores);
        setCategorias(initialCategorias);
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
    // CORREGIDO: usa 'administrador' (tu preferencia)
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
    console.log("App.jsx: Renderizando vista:", vistaActual); // <-- Nuevo log
    switch (vistaActual) {
      case 'login':
        return <LoginView onLogin={handleLogin} onShowRegister={handleShowRegister} onShowCatalog={handleShowCatalog} onShowForgot={() => setShowForgotModal(true)} />;
      case 'register':
        return <RegisterView onShowLogin={handleShowLogin} />;
      case 'catalog':
        // CORREGIDO: pasar categorias a PublicCatalogView
        return <PublicCatalogView productos={productos} categorias={categorias} onBack={handleShowLogin} />;
      case 'client':
        // CORREGIDO: pasar categorias a ClientView
        return <ClientView productos={productos} categorias={categorias} carrito={carrito} setCarrito={setCarrito} onLogout={handleLogout} />;
      case 'admin':
        console.log("App.jsx: Cargando AdminView con props:", { productos, categorias, vistaAdminActiva }); // <-- Nuevo log
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
            onUpdateProducto={handleUpdateProducto}
            onLogout={handleLogout}
          />
        );
      default:
        return <LoginView onLogin={handleLogin} onShowRegister={handleShowRegister} onShowCatalog={handleShowCatalog} onShowForgot={() => setShowForgotModal(true)} />;
    }
  };

  // CORREGIDO: ahora convierte 'categoria' (nombre) a 'categoria_id' (UUID) antes de insertar
  const handleAddProducto = async (nuevoProducto) => {
    try {
      // 1. Buscar el objeto de categoría correspondiente al nombre recibido
      const categoriaSeleccionada = categorias.find(cat => cat.nombre === nuevoProducto.categoria);

      // 2. Validar que la categoría exista
      if (!categoriaSeleccionada) {
        alert('Categoría no encontrada en la base de datos. Por favor, agréguela primero o seleccione una existente.');
        console.error("Categoría no encontrada para el nombre:", nuevoProducto.categoria);
        return; // Detener la ejecución si no se encuentra la categoría
      }

      // 3. Crear un objeto para insertar con el ID de la categoría en lugar del nombre
      const productoParaInsertar = {
        ...nuevoProducto, // Copia todas las propiedades de nuevoProducto
        categoria_id: categoriaSeleccionada.id // Asigna el ID encontrado
        // delete productoParaInsertar.categoria; // Opcional pero recomendado si la columna 'categoria' no existe en Supabase
      };

      // 4. Llamar al servicio con el objeto corregido
      await productService.create(productoParaInsertar);

      // 5. Actualizar el estado local después de la inserción exitosa
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

  // CORREGIDO: ahora recibe los datos del nuevo proveedor
  const handleAddProveedor = async (nuevoProveedor) => {
    try {
      // Validación de teléfono colombiano (opcional pero recomendada)
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
      alert('Error al eliminar el proveedor');
    }
  };

  // CORREGIDO: ahora recibe el nombre de la categoría
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

  const handleUpdateProducto = async (id, cambios) => {
    try {
      if (!id || !cambios || Object.keys(cambios).length === 0) {
        alert('No se proporcionaron cambios válidos.');
        return;
      }

      // Logs para depuración: confirma id, payload y tipos
      console.log('handleUpdateProducto -> id:', id, 'cambios:', cambios);
      if (typeof cambios.cantidad !== 'undefined') {
        console.log('tipo cantidad antes de enviar:', typeof cambios.cantidad, cambios.cantidad);
      }

      const result = await productService.update(id, cambios);

      console.log('productService.update result ->', result);

      if (result?.error) {
        console.error('productService.update returned error:', result.error);
        alert('Error al actualizar el producto: ' + (result.error.message || JSON.stringify(result.error)));
        return;
      }

      const { data } = result;

      if (!data || data.length === 0) {
        console.warn('Update no afectó filas. Verificar id, RLS y nombres de columna.');
        alert('No se pudo actualizar el producto.');
        return;
      }

      const updated = await productService.getAll();
      setProductos(updated);
      return true;
    } catch (err) {
      console.error('Excepción en handleUpdateProducto:', err);
      alert('Error inesperado al actualizar el producto: ' + (err.message || String(err)));
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