// src/components/ClientView.js
import React, { useState, useMemo } from 'react';
import { filtroProductos } from '../utils/helpers';

const ClientView = ({ productos, carrito, setCarrito, total, onLogout, onPay }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');

  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map(p => p.categoria))];
    return ['Todas', ...cats];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return filtroProductos(productos, filtroTxt, filtroCat);
  }, [productos, filtroTxt, filtroCat]);

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

  // Esta función maneja el comportamiento de eliminar '0' al enfocar el input
  const handleInputFocus = (e) => {
    if (e.target.value === '0' || e.target.value === 0) {
      e.target.value = '';
    }
  };

  // Esta función maneja el comportamiento de eliminar '0' mientras se escribe
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
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
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
              <th>Categoria</th>
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

                return (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell" dataTitle="ID">{p.id}</td>
                    <td className="table-cell" dataTitle="Nombre">{p.nombre}</td>
                    <td className="table-cell" dataTitle="Categoria">{p.categoria}</td>
                    <td className="table-cell" dataTitle="Stock" style={{ textAlign: 'center' }}>{p.cantidad}</td>
                    <td className="table-cell qty-input-container" dataTitle="Cantidad">
                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-sm qty-input"
                        id={`qty-${p.id}`} // ID único por producto
                        data-id={p.id} // Usar data-id para identificar el producto
                        data-precio={p.precio} // Usar data-precio para el cálculo
                        value={cantidadActual > 0 ? cantidadActual : ''}
                        placeholder="0"
                        onChange={handleQuantityChange(p.id, p.precio)}
                        onFocus={handleInputFocus} // Añadir onFocus
                        onInput={handleInputInput} // Añadir onInput
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
          <button onClick={onPay} id="btnPay" className="btn btn-success me-2">Pagar</button>
          <button onClick={onLogout} id="btnLogout" className="btn btn-danger">Cerrar Sesión</button>
        </div>
      </div>
    </div>
  );
};

export default ClientView;