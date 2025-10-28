// src/components/Admin/DeleteTab.jsx
import React, { useState } from 'react';

const DeleteTab = ({
  onDeleteProducto,
  onDeleteProveedor,
  onDeleteCategoria,
  productos = [],
  proveedores = [],
  categorias = []
}) => {
  const [inputProducto, setInputProducto] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');

  const [inputProveedor, setInputProveedor] = useState('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');

  const [inputCategoria, setInputCategoria] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  const handleDeleteProducto = (e) => {
    e.preventDefault();
    const valor = inputProducto.trim() || productoSeleccionado;
    if (!valor) {
      alert('Debes escribir o seleccionar un producto.');
      return;
    }
    onDeleteProducto(valor);
    setInputProducto('');
    setProductoSeleccionado('');
    alert('Producto eliminado');
  };

  const handleDeleteProveedor = (e) => {
    e.preventDefault();
    const valor = inputProveedor.trim() || proveedorSeleccionado;
    if (!valor) {
      alert('Debes escribir o seleccionar un proveedor.');
      return;
    }
    onDeleteProveedor(valor);
    setInputProveedor('');
    setProveedorSeleccionado('');
    alert('Proveedor eliminado');
  };

  const handleDeleteCategoria = (e) => {
    e.preventDefault();
    const valor = inputCategoria.trim() || categoriaSeleccionada;
    if (!valor) {
      alert('Debes escribir o seleccionar una categoría.');
      return;
    }
    onDeleteCategoria(valor);
    setInputCategoria('');
    setCategoriaSeleccionada('');
    alert('Categoría eliminada');
  };

  return (
    <>
      {/* -------------------- Eliminar Producto -------------------- */}
      <h5>Eliminar Producto</h5>
      <form onSubmit={handleDeleteProducto}>
        <div className="mb-2">
          <label className="form-label">Selecciona un producto</label>
          <select
            className="form-select"
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
          >
            <option value="">—</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} (ID: {p.id})
              </option>
            ))}
          </select>
          <small className="text-muted">Puedes seleccionar o escribir el ID o nombre.</small>
        </div>
        <div className="mb-2">
          <label className="form-label">O escribe el ID o nombre</label>
          <input
            className="form-control"
            placeholder="ID o nombre del producto"
            value={inputProducto}
            onChange={(e) => setInputProducto(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-danger w-100">
          Eliminar Producto
        </button>
      </form>

      <hr className="my-4" />

      {/* -------------------- Eliminar Proveedor -------------------- */}
      <h5>Eliminar Proveedor</h5>
      <form onSubmit={handleDeleteProveedor}>
        <div className="mb-2">
          <label className="form-label">Selecciona un proveedor</label>
          <select
            className="form-select"
            value={proveedorSeleccionado}
            onChange={(e) => setProveedorSeleccionado(e.target.value)}
          >
            <option value="">—</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} (ID: {p.id})
              </option>
            ))}
          </select>
          <small className="text-muted">Puedes seleccionar o escribir el ID o nombre.</small>
        </div>
        <div className="mb-2">
          <label className="form-label">O escribe el ID o nombre</label>
          <input
            className="form-control"
            placeholder="ID o nombre del proveedor"
            value={inputProveedor}
            onChange={(e) => setInputProveedor(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-warning w-100">
          Eliminar Proveedor
        </button>
      </form>

      <hr className="my-4" />

      {/* -------------------- Eliminar Categoría -------------------- */}
      <h5>Eliminar Categoría</h5>
      <form onSubmit={handleDeleteCategoria}>
        <div className="mb-2">
          <label className="form-label">Selecciona una categoría</label>
          <select
            className="form-select"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="">—</option>
            {categorias.map(c => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
          <small className="text-muted">Puedes seleccionar o escribir el nombre directamente.</small>
        </div>
        <div className="mb-2">
          <label className="form-label">O escribe el nombre</label>
          <input
            className="form-control"
            placeholder="Nombre de la categoría"
            value={inputCategoria}
            onChange={(e) => setInputCategoria(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-secondary w-100">
          Eliminar Categoría
        </button>
      </form>
    </>
  );
};

export default DeleteTab;