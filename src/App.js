// src/App.js
import React, { useState, useEffect } from 'react';
import { initialUsuarios, initialProductos, initialProveedores } from './data/initialData.js';
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

function App() {
  // Estados Globales
  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [productos, setProductos] = useState(initialProductos);
  const [proveedores, setProveedores] = useState(initialProveedores);
  const [carrito, setCarrito] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [vistaActual, setVistaActual] = useState('login'); // 'login', 'register', 'catalog', 'client', 'admin'
  const [vistaAdminActiva, setVistaAdminActiva] = useState('inventory'); // 'inventory', 'add', 'delete', 'providers'

  // Estados para Modales
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState({ title: '', body: '' });

  // Lógica de Negocio (funciones que modifican el estado global)
  const validarUsuario = (user, pass) => {
    const u = user.trim().toLowerCase();
    const p = pass.trim();
    return usuarios.find(x => x.user.toLowerCase()===u && x.pass===p) || null;
  };

  const registrarUsuario = (nuevoUsuario) => {
    setUsuarios(prev => [...prev, nuevoUsuario]);
  };

  const getInventario = () => productos;
  const getProveedores = () => proveedores;

  const agregarProducto = (producto) => {
    setProductos(prev => [...prev, producto]);
  };

  const eliminarProducto = (id) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  const agregarProveedor = (proveedor) => {
    setProveedores(prev => [...prev, proveedor]);
  };

  const actualizarTotal = () => {
    return carrito.reduce((s, c) => s + c.precio, 0);
  };

  // Funciones para cambiar vistas
  const handleLogin = (user, pass) => {
    const usr = validarUsuario(user, pass);
    if (!usr) {
      alert('Usuario/clave inválidos');
      return;
    }
    setUsuarioActual(usr);
    if (usr.role === 'admin') {
      setVistaActual('admin');
      setVistaAdminActiva('inventory'); // Iniciar en Inventario
    } else {
      setVistaActual('client');
    }
  };

  const handleLogout = () => {
    setUsuarioActual(null);
    setCarrito([]);
    setVistaActual('login');
  };

  const handleShowCatalog = () => {
    setVistaActual('catalog');
  };

  const handleShowRegister = () => {
    setVistaActual('register');
  };

  const handleShowLogin = () => {
    setVistaActual('login');
  };

  const handlePay = () => {
    setShowPaymentModal(true);
  };

  const handlePayCard = () => {
    setCarrito([]);
    setShowPaymentModal(false);
    setShowCreditCardModal(true); // Mostrar modal de tarjeta
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

  // Renderizado condicional
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
      {/* Modales */}
      <ForgotPasswordModal show={showForgotModal} onClose={() => setShowForgotModal(false)} />
      <PaymentModal show={showPaymentModal} onClose={() => setShowPaymentModal(false)} onPayCard={handlePayCard} onPayEfecty={handlePayEfecty} />
      <ConfirmationModal show={showConfirmationModal} onClose={() => setShowConfirmationModal(false)} title={confirmationData.title} body={confirmationData.body} />
      <CreditCardModal show={showCreditCardModal} onClose={() => setShowCreditCardModal(false)} onConfirm={handlePayCardConfirm} />
    </div>
  );
}

export default App;