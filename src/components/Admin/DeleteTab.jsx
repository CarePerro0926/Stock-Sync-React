// src/components/Admin/DeleteTab.jsx
import React, { useState } from 'react';

const DeleteTab = ({ onDeleteProducto, onDeleteProveedor, onDeleteCategoria, categorias = [] }) => {
  const [idProducto, setIdProducto] = useState('');
  const [idProveedor, setIdProveedor] = useState('');
  const [idCategoria, setIdCategoria] = useState('');

  const handleDeleteProducto = (e) => {
    e.preventDefault();
    if (!idProducto.trim()) {
      alert('Ingresa un ID de producto para eliminar.');
      return;
    }
    onDeleteProducto(idProducto);
    setIdProducto('');
    alert('Producto eliminado');
  };

  const handleDeleteProveedor = (e) => {
    e.preventDefault();
    if (!idProveedor.trim()) {
      alert('Ingresa un ID de proveedor para eliminar.');
      return;
    }
    onDeleteProveedor(idProveedor);
    setIdProveedor('');
    alert('Proveedor eliminado');
  };

  const handleDeleteCategoria = (e) => {
    e.preventDefault();
    if (!idCategoria) {
      alert('Selecciona una categoría para eliminar.');
      return;
    }
    onDeleteCategoria(idCategoria);
    setIdCategoria('');
    alert('Categoría eliminada');
  };

  const listaCategorias = Array.isArray(categorias) ? categorias : [];

  return (
    <>
      <h5>Eliminar Producto</h5>
      <form onSubmit={handleDeleteProducto}>
        <div className="row g-2 mb-3">
          <div className="col-12 col-md">
            <input
              className="form-control"
              placeholder="ID del producto"
              value={idProducto}
              onChange={(e) => setIdProducto(e.target.value)}
            />
          </div>
          <div className="col-12 col-md">
            <button type="submit" className="btn btn-danger w-100">Eliminar Producto</button>
          </div>
        </div>
      </form>

      <hr className="my-4" />

      <h5>Eliminar Proveedor</h5>
      <form onSubmit={handleDeleteProveedor}>
        <div className="row g-2 mb-3">
          <div className="col-12 col-md">
            <input
              className="form-control"
              placeholder="ID del proveedor"
              value={idProveedor}
              onChange={(e) => setIdProveedor(e.target.value)}
            />
          </div>
          <div className="col-12 col-md">
            <button type="submit" className="btn btn-warning w-100">Eliminar Proveedor</button>
          </div>
        </div>
      </form>

      <hr className="my-4" />

      <h5>Eliminar Categoría</h5>
      <form onSubmit={handleDeleteCategoria}>
        <div className="row g-2 mb-3">
          <div className="col-12 col-md">
            <select
              className="form-control"
              value={idCategoria}
              onChange={(e) => setIdCategoria(e.target.value)}
              required
            >
              <option value="">Seleccionar categoría</option>
              {listaCategorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md">
            <button type="submit" className="btn btn-secondary w-100">Eliminar Categoría</button>
          </div>
        </div>
      </form>
    </>
  );
};

export default DeleteTab;