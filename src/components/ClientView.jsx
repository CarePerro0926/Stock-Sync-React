// src/components/ClientView.jsx
import React, { useState, useMemo } from 'react';
import { usePayment } from '../hooks/usePayment'; // ✅ Importa el hook
import { filtroProductos } from '../utils/helpers';

const ClientView = ({ productos, categorias, carrito, setCarrito, onLogout }) => { // Recibe categorias
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false); // ✅ Estado para el modal de pago

  // Normaliza categorias por si viene undefined
  const cats = Array.isArray(categorias) ? categorias : [];

  // Mapear categoria_id a nombre si es necesario
  const productosConNombreCategoria = useMemo(() => {
    return productos.map(p => {
      if (p.categoria_nombre) {
        // Si ya tiene categoria_nombre, devolverlo como está
        return p;
      } else if (p.categoria_id) {
        // Si tiene categoria_id, buscar el nombre
        const categoria = cats.find(c => c.id === p.categoria_id);
        return { ...p, categoria_nombre: categoria ? categoria.nombre : 'Categoría Desconocida', categoria: categoria ? categoria.nombre : 'Categoría Desconocida' }; // Añadir 'categoria' también para compatibilidad con filtroProductos
      } else if (p.categoria) {
        // Si tiene categoria (nombre directo), devolverlo como está (compatibilidad con initialData)
        return p;
      }
      // Si no tiene ninguno, asignar un nombre por defecto
      return { ...p, categoria_nombre: 'Sin Categoría', categoria: 'Sin Categoría' };
    });
  }, [productos, cats]);

  // Usa el hook de pago
  const {
    showCreditCardModal,
    showConfirmationModal,
    confirmationData,
    handlePayCard,
    handlePayEfecty,
    handlePayCardConfirm,
    closeModals
  } = usePayment(() => setCarrito([])); // Limpia el carrito al pagar

  const total = carrito.reduce((sum, item) => sum + item.precio, 0);

  const categoriasFiltro = useMemo(() => {
  const nombres = cats.map(c => c.nombre).filter(Boolean);
  return ['Todas', ...nombres];
}, [cats]);

  const productosFiltrados = useMemo(() => {
    return filtroProductos(productosConNombreCategoria, filtroTxt, filtroCat); // Usar productos con categoria mapeada
  }, [productosConNombreCategoria, filtroTxt, filtroCat]);

  const handleQuantityChange = (productoId, precioUnitario) => (e) => {
    const cantidad = parseInt(e.target.value) || 0;
    setCarrito(prevCarrito => {
      const idx = prevCarrito.findIndex(item => item.id === productoId);
      let newCarrito = [...prevCarrito];

      if (cantidad > 0) {
        if (idx > -1) {
          newCarrito[idx] = { ...newCarrito[idx], cantidad, precio: precioUnitario * cantidad };
        } else {
          newCarrito.push({ id: productoId, cantidad, precio: precioUnitario * cantidad });
        }
      } else {
        if (idx > -1) {
          newCarrito.splice(idx, 1);
        }
      }
      return newCarrito;
    });
  };

  const handleInputFocus = (e) => {
    if (e.target.value === '0' || e.target.value === 0) {
      e.target.value = '';
    }
  };

  const handleInputInput = (e) => {
    if (e.target.value === '0' || e.target.value === 0) {
      e.target.value = '';
    }
  };

  return (
    <div className="card p-4">
      <h4 className="text-dark">Catálogo de Productos</h4>
      <div className="row g-2 mb-3">
        <div className="col">
          <select id="filtroCat" className="form-select" value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}>
            {categoriasFiltro.map(c => <option key={c} value={c}>{c}</option>)} {/* Usar categoriasFiltro */}
          </select>
        </div>
        <div className="col">
          <input
            id="filtroTxt"
            className="form-control"
            placeholder="Buscar..."
            value={filtroTxt}
            onChange={(e) => setFiltroTxt(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive responsive-table" style={{ maxHeight: '300px', overflow: 'auto' }}>
        <table className="table table-bordered table-sm mb-0">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoria</th> {/* Mostrar categoria_nombre */}
              <th>Stock</th>
              <th style={{ width: '60px' }}>Cantidad</th>
              <th style={{ width: '120px' }}>Precio Unidad</th>
            </tr>
          </thead>
          <tbody id="tblClient">
            {productosFiltrados.length === 0 ? (
              <tr><td colSpan="6" className="text-center">No se encontraron productos.</td></tr>
            ) : (
              productosFiltrados.map(p => {
                const itemCarrito = carrito.find(item => item.id === p.id);
                const cantidadActual = itemCarrito ? itemCarrito.cantidad : 0;

                // reemplaza este bloque dentro de productosFiltrados.map(...)
                return (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell" data-title="ID">{p.id}</td>
                    <td className="table-cell" data-title="Nombre">{p.nombre}</td>
                    <td className="table-cell" data-title="Categoria">{p.categoria_nombre}</td> {/* Mostrar categoria_nombre */}
                    <td className="table-cell" data-title="Stock" style={{ textAlign: 'center' }}>{p.cantidad}</td>
                    <td className="table-cell qty-input-container" data-title="Cantidad">
                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-sm qty-input"
                        id={`qty-${p.id}`}
                        data-id={p.id}
                        data-precio={p.precio}
                        value={cantidadActual > 0 ? cantidadActual : ''}
                        placeholder="0"
                        onChange={handleQuantityChange(p.id, p.precio)}
                        onFocus={handleInputFocus}
                        onInput={handleInputInput}
                      />
                    </td>
                    <td className="table-cell" data-title="Precio Unidad" style={{ textAlign: 'right' }}>
                      {typeof p.precio === 'number' ? p.precio.toLocaleString('es-CO') : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="d-flex flex-wrap align-items-center mt-3">
        <strong style={{ fontSize: '1.3em' }} className="me-auto">
          <span style={{ color: '#FF4500' }}>Total: $</span>
          <span id="totalLbl" style={{ color: '#222' }}>{total.toLocaleString('es-CO')} COP</span>
        </strong>
        <div>
          {/* Reemplaza el alert por la apertura del modal de pago */}
          <button onClick={() => setShowPaymentModal(true)} id="btnPay" className="btn btn-success me-2">Pagar</button>
          <button onClick={onLogout} id="btnLogout" className="btn btn-danger">Cerrar Sesión</button>
        </div>
      </div>

      {/* Modal de selección de método de pago */}
      {showPaymentModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-primary w-100 text-center">Método de Pago</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <div className="modal-body px-0 pt-3 pb-4">
                <button onClick={() => { handlePayCard(); setShowPaymentModal(false); }} id="payCard" className="btn btn-dark w-100 mb-2">Tarjeta</button>
                <button onClick={() => { handlePayEfecty(); setShowPaymentModal(false); }} id="payEfecty" className="btn btn-success w-100">Consignación en Efecty</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de tarjeta */}
      {showCreditCardModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-primary w-100 text-center">Agregar Tarjeta</h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <div className="modal-body px-0 pt-3 pb-4">
                <div className="mb-3">
                  <label className="form-label">Número de tarjeta</label>
                  <input type="text" className="form-control" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label">Fecha de vencimiento</label>
                    <input type="text" className="form-control" placeholder="MM/AA" /> {/* CORREGIDO: Auto-cierre */}
                  </div>
                  <div className="col-6">
                    <label className="form-label">CVC</label>
                    <input type="text" className="form-control" placeholder="123" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre del titular</label>
                  <input type="text" className="form-control" placeholder="Juan Pérez" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo de tarjeta</label>
                  <select className="form-select">
                    <option>Visa</option>
                    <option>Mastercard</option>
                    <option>American Express</option>
                    <option>Diners Club</option>
                  </select>
                </div>
                <button onClick={handlePayCardConfirm} className="btn btn-primary w-100">Pagar con tarjeta</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación (Efecty) */}
      {showConfirmationModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-primary w-100 text-center">{confirmationData.title}</h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <div className="modal-body px-0 pt-3 pb-4">
                <div dangerouslySetInnerHTML={{ __html: confirmationData.body }} />
                <button onClick={closeModals} className="btn btn-secondary w-100 mt-3">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientView;