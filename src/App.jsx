// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { filtroProductos } from './utils/helpers';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import PublicCatalogView from './components/PublicCatalogView';
import ClientView from './components/ClientView';
import AdminView from './components/AdminView';
import ForgotPasswordModal from './components/Modals/ForgotPasswordModal';
import PaymentModal from './components/Modals/PaymentModal';
import ConfirmationModal from './components/Modals/ConfirmationModal';
import CreditCardModal from './components/Modals/CreditCardModal';
import { migrarDatos } from './utils/migrarDatos'; //  Solo una función de migración

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [vistaActual, setVistaActual] = useState('login');
  const [vistaAdminActiva, setVistaAdminActiva] = useState('inventory');

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState({ title: '', body: '' });

  //  Solo una migración al inicio (en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      migrarDatos(); // Esta función debe insertar proveedores, productos y usuarios
    }
  }, []);

  //  Cargar datos desde tablas en español
  useEffect(() => {
    const cargarDatos = async () => {
      const { data: productosDB } = await supabase.from('productos').select('*');
      const { data: proveedoresDB } = await supabase.from('proveedores').select('*'); //  'proveedores', no 'providers'
      const { data: usuariosDB } = await supabase.from('usuarios').select('*');

      const productosTransformados = productosDB?.map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        cantidad: p.cantidad,
        categoria: p.categoria
      })) || [];

      setProductos(productosTransformados);
      setProveedores(proveedoresDB || []);
      setUsuarios(usuariosDB || []);
    };

    cargarDatos();
  }, []);

  const validarUsuario = async (user, pass) => {
    const u = user.trim().toLowerCase();
    const p = pass.trim();

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', u)
      .eq('pass', p);

    if (error) {
      console.error(' Error al consultar usuario:', error);
      return null;
    }

    return data?.[0] || null; //  Devuelve el primer usuario o null
  };

  const handleLogin = async (user, pass) => {
    const usr = await validarUsuario(user, pass);
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
      //  No necesitas created_at: Supabase lo agrega si tienes la columna
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

  const eliminarProducto = (id) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

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

  const actualizarTotal = () => carrito.reduce((s, c) => s + c.precio, 0);

  const handleLogout = () => {
    setUsuarioActual(null);
    setCarrito([]);
    setVistaActual('login');
  };

  const handleShowCatalog = () => setVistaActual('catalog');
  const handleShowRegister = () => setVistaActual('register');
  const handleShowLogin = () => setVistaActual('login');

  const handlePay = () => setShowPaymentModal(true);
  const handlePayCard = () => {
    setCarrito([]);
    setShowPaymentModal(false);
    setShowCreditCardModal(true);
  };

  const handlePayEfecty = () => {
    setCarrito([]);
    setShowPaymentModal(false);
    const codigo = Math.floor(100000 + Math.random() * 900000);
    setConfirmationData({
      title: 'Consignación en Efecty seleccionada',
      body: `<div>Guarde este código de consignación:</div><strong style="font-size:1.5em;">${codigo}</strong>`
    });
    setShowConfirmationModal(true);
  };

  const handlePayCardConfirm = () => {
    setShowCreditCardModal(false);
    alert("Pago con tarjeta procesado (simulado). Carrito vaciado.");
  };

  const renderView = () => {
    switch (vistaActual) {
      case 'login':
        return <LoginView onLogin={handleLogin} onShowRegister={handleShowRegister} onShowCatalog={handleShowCatalog} onShowForgot={() => setShowForgotModal(true)} />;
      case 'register':
        return <RegisterView usuarios={usuarios} onRegister={registrarUsuario} onShowLogin={handleShowLogin} />;
      case 'catalog':
        return <PublicCatalogView productos={getInventario()} onBack={handleShowLogin} />;
      case 'client':
        return <ClientView productos={getInventario()} carrito={carrito} setCarrito={setCarrito} total={actualizarTotal()} onLogout={handleLogout} onPay={handlePay} />;
      case 'admin':
        return <AdminView productos={getInventario()} proveedores={getProveedores()} vistaActiva={vistaAdminActiva} setVistaActiva={setVistaAdminActiva} onAddProducto={agregarProducto} onDeleteProducto={eliminarProducto} onAddProveedor={agregarProveedor} onLogout={handleLogout} />;
      default:
        return <LoginView onLogin={handleLogin} onShowRegister={handleShowRegister} onShowCatalog={handleShowCatalog} onShowForgot={() => setShowForgotModal(true)} />;
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-center">
        {renderView()}
      </div>
      <ForgotPasswordModal show={showForgotModal} onClose={() => setShowForgotModal(false)} />
      <PaymentModal show={showPaymentModal} onClose={() => setShowPaymentModal(false)} onPayCard={handlePayCard} onPayEfecty={handlePayEfecty} />
      <ConfirmationModal show={showConfirmationModal} onClose={() => setShowConfirmationModal(false)} title={confirmationData.title} body={confirmationData.body} />
      <CreditCardModal show={showCreditCardModal} onClose={() => setShowCreditCardModal(false)} onConfirm={handlePayCardConfirm} />
    </div>
  );
}

export default App;