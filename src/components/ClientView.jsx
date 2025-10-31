// src/components/ClientView.jsx
import React, { useState, useMemo } from 'react';
import { usePayment } from '../hooks/usePayment';
import './ResponsiveTable.css'; // 👈 Mantiene el modo tarjeta

const ClientView = ({ productos, categorias, carrito, setCarrito, onLogout }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const cats = Array.isArray(categorias) ? categorias : [];

  const productosConNombreCategoria = useMemo(() => {
    return productos.map(p => {
      if (p.categoria_nombre) return p;
      const categoria = cats.find(c => c.id === p.categoria_id);
      return { ...p, categoria_nombre: categoria ? categoria.nombre : 'Sin Categoría', categoria: categoria ? categoria.nombre : 'Sin Categoría' };
    });
  }, [productos, cats]);

  const {
    showCreditCardModal,
    showConfirmationModal,
    confirmationData,
    handlePayCard,
    handlePayEfecty,
    handlePayCardConfirm,
    closeModals
  } = usePayment(() => setCarrito([]));

  const total = carrito.reduce((sum, item) => sum + item.precio, 0);

  const categoriasFiltro = useMemo(() => {
    const nombres = cats.map(c => c.nombre).filter(Boolean);
    return ['Todas', ...nombres];
  }, [cats]);

  const productosFiltrados = useMemo(() => {
    return productosConNombreCategoria.filter(p => {
      const coincideCat = filtroCat === 'Todas' || p.categoria_nombre === filtroCat;
      const coincideTxt = !filtroTxt || p.nombre.toLowerCase().includes(filtroTxt.toLowerCase());
      return coincideCat && coincideTxt;
    });
  }, [productosConNombreCategoria, filtroCat, filtroTxt]);

  const handleQuantityChange = (productoId, precioUnitario) => (e) => {
    const cantidad = parseInt(e.target.value) || 0;
    setCarrito(prev => {
      const idx = prev.findIndex(item => item.id === productoId);
      let newCarrito = [...prev];
      if (cantidad > 0) {
        if (idx > -1) {
          newCarrito[idx] = { ...newCarrito[idx], cantidad, precio: precioUnitario * cantidad };
        } else {
          newCarrito.push({ id: productoId, cantidad, precio: precioUnitario * cantidad });
        }
      } else {
        if (idx > -1) newCarrito.splice(idx, 1);
      }
      return newCarrito;
    });
  };

  // 👇 Preparar datos para ResponsiveTable
  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria_nombre', label: 'Categoría' },
    { key: 'cantidad', label: 'Stock' },
    { key: 'cantidadInput', label: 'Cantidad' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' }
  ];

  const tableData = productosFiltrados.map(p => {
    const itemCarrito = carrito.find(item => item.id === p.id);
    const cantidadActual = itemCarrito ? itemCarrito.cantidad : 0;
    return {
      id: p.id,
      nombre: p.nombre,
      categoria_nombre: p.categoria_nombre,
      cantidad: p.cantidad,
      cantidadInput: (
        <input
          type="number"
          min="0"
          className="form-control form-control-sm qty-input"
          value={cantidadActual > 0 ? cantidadActual : ''}
          placeholder="0"
          onChange={handleQuantityChange(p.id, p.precio)}
          style={{ width: '80px' }}
        />
      ),
      precio: typeof p.precio === 'number' ? p.precio.toLocaleString('es-CO') : '—'
    };
  });

  return (
    <div className="card p-4 w-100">
      <h4 className="text-dark">Catálogo de Productos</h4>

      {/* Filtros: siempre visibles */}
      <div className="row g-2 mb-3">
        <div className="col">
          <select className="form-select" value={filtroCat} onChange={e => setFiltroCat(e.target.value)}>
            {categoriasFiltro.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Buscar..."
            value={filtroTxt}
            onChange={e => setFiltroTxt(e.target.value)}
          />
        </div>
      </div>

      {/* 👇 Contenedor con scroll VERTICAL solo para la tabla/tarjetas */}
      <div style={{ maxHeight: '45vh', overflowY: 'auto', marginBottom: '1rem' }}>
        <div className="responsive-table-container">
          <table className="responsive-table w-100">
            <thead>
              <tr>
                {tableHeaders.map(h => (
                  <th key={h.key} style={{ textAlign: h.align || 'left' }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr><td colSpan="6" className="text-center">No se encontraron productos.</td></tr>
              ) : (
                tableData.map((row, i) => (
                  <tr key={i} className="table-row">
                    {tableHeaders.map(h => (
                      <td
                        key={h.key}
                        data-label={h.label}
                        className="table-cell"
                        style={{ textAlign: h.align || 'left', verticalAlign: 'middle' }}
                      >
                        {row[h.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botones: siempre visibles */}
      <div className="d-flex flex-wrap align-items-center mt-3">
        <strong style={{ fontSize: '1.3em' }} className="me-auto">
          <span style={{ color: '#FF4500' }}>Total: $</span>
          <span>{total.toLocaleString('es-CO')} COP</span>
        </strong>
        <div>
          <button onClick={() => setShowPaymentModal(true)} className="btn btn-success me-2">Pagar</button>
          <button onClick={onLogout} className="btn btn-danger">Cerrar Sesión</button>
        </div>
      </div>

      {/* Modales (sin cambios) */}
      {showPaymentModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-primary w-100 text-center">Método de Pago</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <div className="modal-body px-0 pt-3 pb-4">
                <button onClick={() => { handlePayCard(); setShowPaymentModal(false); }} className="btn btn-dark w-100 mb-2">Tarjeta</button>
                <button onClick={() => { handlePayEfecty(); setShowPaymentModal(false); }} className="btn btn-success w-100">Consignación en Efecty</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <input type="text" className="form-control" placeholder="MM/AA" />
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
                <button onClick={handlePayCardConfirm} className="btn btn-success me-2">Pagar con tarjeta</button>
              </div>
            </div>
          </div>
        </div>
      )}

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