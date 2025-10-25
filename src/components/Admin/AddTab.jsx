// src/components/Admin/AddTab.jsx
import React, { useState } from 'react';

const AddTab = ({ onAddProducto, onAddCategoria, proveedores = [], categorias = [] }) => {
  const [nuevoProducto, setNuevoProducto] = useState({
    id: '',
    nombre: '',
    categoria: '',
    cantidad: '',
    precio: '',
    provider_id: ''
  });
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto({
      ...nuevoProducto,
      [name]: ['cantidad', 'precio', 'provider_id'].includes(name)
        ? value === '' ? '' : Number(value)
        : value
    });
  };

  const handleAddProductoSubmit = (e) => {
    e.preventDefault();
    const { id, nombre, categoria, cantidad, precio, provider_id } = nuevoProducto;
    if (!id || !nombre || !categoria || !cantidad || !precio || !provider_id) {
      alert('Por favor completa todos los campos del producto.');
      return;
    }
    onAddProducto(nuevoProducto);
    setNuevoProducto({ id: '', nombre: '', categoria: '', cantidad: '', precio: '', provider_id: '' });
  };

  const handleAddCategoriaSubmit = (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) {
      alert('Ingresa el nombre de la categoría.');
      return;
    }
    onAddCategoria(nuevaCategoria.trim());
    setNuevaCategoria('');
  };

  const listaProveedores = Array.isArray(proveedores) ? proveedores : [];

  return (
    <>
      <h5>Agregar Producto</h5>
      <form onSubmit={handleAddProductoSubmit} className="mb-4">
        <div className="mb-2">
          <input type="text" className="form-control" name="id" placeholder="ID" value={nuevoProducto.id} onChange={handleProductoChange} required />
        </div>
        <div className="mb-2">
          <input type="text" className="form-control" name="nombre" placeholder="Nombre" value={nuevoProducto.nombre} onChange={handleProductoChange} required />
        </div>
        <div className="mb-2">
          <select className="form-control" name="categoria" value={nuevoProducto.categoria} onChange={handleProductoChange} required>
            <option value="">Seleccionar categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <input type="number" className="form-control" name="cantidad" placeholder="Cantidad" value={nuevoProducto.cantidad} onChange={handleProductoChange} required />
        </div>
        <div className="mb-2">
          <input type="number" className="form-control" name="precio" placeholder="Precio" value={nuevoProducto.precio} onChange={handleProductoChange} required />
        </div>
        <div className="mb-2">
          <select className="form-control" name="provider_id" value={nuevoProducto.provider_id} onChange={handleProductoChange} required>
            <option value="">Seleccionar proveedor</option>
            {listaProveedores.length > 0 ? (
              listaProveedores.map(prov => (
                <option key={prov.id} value={prov.id}>{prov.nombre}</option>
              ))
            ) : (
              <option disabled>No hay proveedores</option>
            )}
          </select>
        </div>
        <button type="submit" className="btn btn-success w-100">Agregar Producto</button>
      </form>

      <hr className="my-4" />

      <h5>Agregar Categoría</h5>
      <form onSubmit={handleAddCategoriaSubmit}>
        <div className="row g-2 mb-3">
          <div className="col-12 col-md">
            <input
              className="form-control"
              placeholder="Nombre de la categoría"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              required
            />
          </div>
          <div className="col-12 col-md">
            <button type="submit" className="btn btn-info w-100">Agregar Categoría</button>
          </div>
        </div>
      </form>
    </>
  );
};

export default AddTab;