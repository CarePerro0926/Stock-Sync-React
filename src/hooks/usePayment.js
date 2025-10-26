// src/hooks/usePayment.js
import { useState } from 'react';

export const usePayment = (onClearCart) => {
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState({ title: '', body: '' });

  const handlePayCard = () => {
    onClearCart();
    setShowCreditCardModal(true);
  };

  const handlePayEfecty = () => {
    onClearCart();
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

  const closeModals = () => {
    setShowCreditCardModal(false);
    setShowConfirmationModal(false);
  };

  return {
    // Estados
    showCreditCardModal,
    showConfirmationModal,
    confirmationData,

    // Acciones
    handlePayCard,
    handlePayEfecty,
    handlePayCardConfirm,
    closeModals
  };
};