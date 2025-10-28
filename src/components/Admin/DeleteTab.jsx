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
  const [idProductoManual, setIdProductoManual] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');

  const [idProveedorManual, setIdProveedorManual] = useState('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');

  const [nombreCategoriaManual, setNombreCategoriaManual] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  const handleDeleteProducto = (e) => {
    e.preventDefault();
    const idFinal = idProductoManual.trim() || productoSeleccionado;
    if (!idFinal) {
      alert('Selecciona o escribe un ID de producto.');
      return;
    }
    onDeleteProducto(idFinal);
    setIdProductoManual('');
    setProductoSeleccionado('');
    alert('Producto eliminado');
  };

  const handleDeleteProveedor = (e) => {
    e.preventDefault();
    const idFinal = idProveedorManual.trim() || proveedorSeleccionado;
    if (!idFinal) {
      alert('Selecciona o escribe un ID de proveedor.');
      return;
    }
    onDeleteProveedor(idFinal);
    setIdProveedorManual('');
    setProveedorSeleccionado('');
    alert('Proveedor eliminado');
  };

  const handleDeleteCategoria = (e) => {
    e.preventDefault();
    const nombreFinal = nombreCategoriaManual.trim() || categoriaSeleccionada;
    if (!nombreFinal) {
      alert('Selecciona o escribe el nombre de la categoría.');
      return;
    }
    onDeleteCategoria(nombreFinal);
    setNombreCategoriaManual('');
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
        </div>
        <div className="mb-2">
          <label className="form-label">O escribe el ID directamente</label>
          <input
            className="form-control"
            placeholder="ID del producto"
            value={idProductoManual}
            onChange={(e) => setIdProductoManual(e.target.value)}
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
        </div>
        <div className="mb-2">
          <label className="form-label">O escribe el ID directamente</label>
          <input
            className="form-control"
            placeholder="ID del proveedor"
            value={idProveedorManual}
            onChange={(e) => setIdProveedorManual(e.target.value)}
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
        </div>
        <div className="mb-2">
          <label className="form-label">O escribe el nombre directamente</label>
          <input
            className="form-control"
            placeholder="Nombre de la categoría"
            value={nombreCategoriaManual}
            onChange={(e) => setNombreCategoriaManual(e.target.value)}
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