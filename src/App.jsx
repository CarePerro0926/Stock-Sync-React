// src/App.jsx
import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { supabase } from './services/supabaseClient';
<<<<<<< HEAD
import { filtroProductos } from './utils/helpers';
=======
>>>>>>> 58cb29c (ultima version)
=======
>>>>>>> 3ca678d89a8bf5a3c6912987482849848afec5dd
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import PublicCatalogView from './components/PublicCatalogView';
import ClientView from './components/ClientView';
import AdminView from './components/AdminView';
import ForgotPasswordModal from './components/Modals/ForgotPasswordModal';
<<<<<<< HEAD
import PaymentModal from './components/Modals/PaymentModal';
import ConfirmationModal from './components/Modals/ConfirmationModal';
import CreditCardModal from './components/Modals/CreditCardModal';
<<<<<<< HEAD
import { migrarDatos } from './utils/migrarDatos'; //  Solo una función de migración
=======
import { migrarDatos } from './utils/migrarDatos';

const CATEGORIAS_PERMITIDAS = [
  'Procesadores',
  'Tarjetas Gráficas',
  'Memorias RAM',
  'Discos Duros',
  'Boards',
  'Fuentes de Poder',
  'Gabinetes',
  'Periféricos',
  'Monitores',
  'Refrigeración',
  'Redes',
  'Accesorios',
  'Mobiliario'
];
>>>>>>> 58cb29c (ultima version)
=======
import { productService } from './services/productService';
import { providerService } from './services/providerService';
import { categoryService } from './services/categoryService';
import { initialProductos, initialProveedores, initialCategorias } from './data/initialData';
>>>>>>> 3ca678d89a8bf5a3c6912987482849848afec5dd

function App() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [vistaActual, setVistaActual] = useState('login');
  const [vistaAdminActiva, setVistaAdminActiva] = useState('inventory');
  const [showForgotModal, setShowForgotModal] = useState(false);

<<<<<<< HEAD
<<<<<<< HEAD
  //  Solo una migración al inicio (en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      migrarDatos(); // Esta función debe insertar proveedores, productos y usuarios
    }
  }, []);

  //  Cargar datos desde tablas en español
=======
  // Cargar datos iniciales
>>>>>>> 3ca678d89a8bf5a3c6912987482849848afec5dd
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

<<<<<<< HEAD
  const registrarUsuario = async (nuevoUsuario) => {
    const { error } = await supabase.from('usuarios').insert({
      username: nuevoUsuario.user,
      pass: nuevoUsuario.pass,
      role: nuevoUsuario.role
      //  No necesitas created_at: Supabase lo agrega si tienes la columna
    });

    if (error) {
      console.error('❌ Error al registrar usuario:', error);
    } else {
      const { data } = await supabase.from('usuarios').select('*');
      setUsuarios(data || []);
    }
  };
=======
  // Solo una migración al inicio (en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // migrarDatos();
    }
  }, []);

  // Cargar datos desde tablas en español
  useEffect(() => {
    const cargarDatos = async () => {
      const { data: productosDB } = await supabase.from('productos').select('*');
      const { data: proveedoresDB } = await supabase.from('proveedores').select('*');
      const { data: usuariosDB } = await supabase.from('usuarios').select('*');
>>>>>>> 58cb29c (ultima version)

      const productosTransformados = productosDB?.map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        cantidad: p.cantidad,
        categoria: p.categoria
      })) || [];

<<<<<<< HEAD
  const agregarProducto = async (producto) => {
    const { error } = await supabase.from('productos').insert({
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: producto.cantidad,
      categoria: producto.categoria,
      id_proveedor: producto.provider_id //  Asegúrate de que este campo exista en la tabla
    });

    if (error) {
      console.error('❌ Error al insertar producto:', error);
    } else {
      const { data } = await supabase.from('productos').select('*');
      const productosTransformados = data?.map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        cantidad: p.cantidad,
        categoria: p.categoria
      })) || [];
      setProductos(productosTransformados);
    }
  };
=======
      setProductos(productosTransformados);
      setProveedores(proveedoresDB || []);
      setUsuarios(usuariosDB || []);
    };
>>>>>>> 58cb29c (ultima version)

    cargarDatos();
  }, []);

<<<<<<< HEAD
  const agregarProveedor = async (proveedor) => {
    const { error } = await supabase.from('proveedores').insert({ // 'proveedores', no 'providers'
      nombre: proveedor.nombre,
      email: proveedor.email,
      telefono: proveedor.phone || ''
    });

    if (error) {
      console.error('❌ Error al insertar proveedor:', error);
    } else {
      const { data } = await supabase.from('proveedores').select('*');
      setProveedores(data || []);
    }
  };

=======
  // ✅ handleLogin ahora recibe directamente el usuario (ya validado)
  const handleLogin = (usr) => {
    if (!usr) {
      alert('Usuario/clave inválidos');
      return;
    }
    setUsuarioActual(usr);
    setVistaActual(usr.role === 'admin' ? 'admin' : 'client');
    if (usr.role === 'admin') setVistaAdminActiva('inventory');
  };

  const registrarUsuario = async (nuevoUsuario) => {
    const { error } = await supabase.from('usuarios').insert({
      username: nuevoUsuario.user,
      pass: nuevoUsuario.pass,
      role: nuevoUsuario.role
    });

    if (error) {
      console.error('❌ Error al registrar usuario:', error);
    } else {
      const { data } = await supabase.from('usuarios').select('*');
      setUsuarios(data || []);
    }
  };

  const getInventario = () => productos;
  const getProveedores = () => proveedores;

  const agregarProducto = async (producto) => {
    const { error } = await supabase.from('productos').insert({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: producto.cantidad,
      categoria: producto.categoria,
      id_proveedor: producto.provider_id
    });

    if (error) {
      console.error('Error:', error);
      alert('Error al guardar el producto');
      return;
    }

    const { data } = await supabase.from('productos').select('*');
    const productosTransformados = data?.map(p => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      cantidad: p.cantidad,
      categoria: p.categoria
    })) || [];
    setProductos(productosTransformados);
  };

  const eliminarProducto = async (id) => {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(' Error al eliminar producto:', error);
      alert('Error al eliminar el producto');
      return;
    }

    setProductos(prev => prev.filter(p => p.id !== id));
  };

  const agregarProveedor = async (proveedor) => {
    const { error } = await supabase.from('proveedores').insert({
      nombre: proveedor.nombre,
      email: proveedor.email,
      telefono: proveedor.phone || ''
    });

    if (error) {
      console.error('Error al insertar proveedor:', error);
    } else {
      const { data } = await supabase.from('proveedores').select('*');
      setProveedores(data || []);
    }
  };

>>>>>>> 58cb29c (ultima version)
  const actualizarTotal = () => carrito.reduce((s, c) => s + c.precio, 0);

=======
>>>>>>> 3ca678d89a8bf5a3c6912987482849848afec5dd
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
        return <PublicCatalogView productos={productos} categorias={categorias} onBack={handleShowLogin} />; // CORREGIDO: pasar categorias
      case 'client':
        return <ClientView productos={productos} categorias={categorias} carrito={carrito} setCarrito={setCarrito} onLogout={handleLogout} />; // CORREGIDO: pasar categorias
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

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-center">{renderView()}</div>
      <ForgotPasswordModal show={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </div>
  );
}

export default App;