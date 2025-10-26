// src/components/Admin/AddTab.jsx
import React, { useState } from 'react';

const AddTab = ({ onAddProducto, onAddCategoria, onAddProveedor, proveedores = [], categorias = [] }) => {
  // Estados para producto
  const [nuevoProducto, setNuevoProducto] = useState({
    id: '',
    nombre: '',
    categoria: '',
    cantidad: '',
    precio: '',
    provider_id: ''
  });

  // Estado para nueva categoría
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  // Estado para nuevo proveedor
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    email: '',
    telefono: '',
    categorias: [] // Array de IDs de categorías seleccionadas
  });

  // Manejadores de producto
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

  // Manejador de categoría
  const handleAddCategoriaSubmit = (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) {
      alert('Ingresa el nombre de la categoría.');
      return;
    }
    onAddCategoria(nuevaCategoria.trim());
    setNuevaCategoria('');
  };

  // Manejadores de proveedor
  const handleProveedorChange = (e) => {
    const { name, value } = e.target;
    setNuevoProveedor({ ...nuevoProveedor, [name]: value });
  };

  const handleAddProveedorSubmit = (e) => {
    e.preventDefault();
    const { nombre, email, telefono, categorias } = nuevoProveedor;
    if (!nombre || !email) {
      alert('Por favor completa al menos nombre y correo del proveedor.');
      return;
    }
    onAddProveedor({ nombre, email, telefono, categorias });
    setNuevoProveedor({ nombre: '', email: '', telefono: '', categorias: [] });
  };

  const listaProveedores = Array.isArray(proveedores) ? proveedores : [];

  return (
    <>
      {/* Agregar Producto */}
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

      {/* Agregar Categoría */}
      <h5>Agregar Categoría</h5>
      <form onSubmit={handleAddCategoriaSubmit} className="mb-4">
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

      <hr className="my-4" />

      {/* Agregar Proveedor */}
      <h5>Agregar Proveedor</h5>
      <form onSubmit={handleAddProveedorSubmit}>
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            name="nombre"
            placeholder="Nombre del proveedor"
            value={nuevoProveedor.nombre}
            onChange={handleProveedorChange}
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="email"
            className="form-control"
            name="email"
            placeholder="Correo electrónico"
            value={nuevoProveedor.email}
            onChange={handleProveedorChange}
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            name="telefono"
            placeholder="Teléfono (opcional)"
            value={nuevoProveedor.telefono}
            onChange={handleProveedorChange}
          />
        </div>

        {/* ✅ Checkbox list para seleccionar categorías (ideal para móviles) */}
        <div className="mb-3">
          <label className="form-label">Categorías que surte</label>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {categorias.map(cat => (
              <div key={cat.id} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`cat-${cat.id}`}
                  checked={nuevoProveedor.categorias.includes(cat.id)}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setNuevoProveedor(prev => {
                      if (isChecked) {
                        return { ...prev, categorias: [...prev.categorias, cat.id] };
                      } else {
                        return { ...prev, categorias: prev.categorias.filter(id => id !== cat.id) };
                      }
                    });
                  }}
                />
                <label className="form-check-label" htmlFor={`cat-${cat.id}`}>
                  {cat.nombre}
                </label>
              </div>
            ))}
          </div>
          {categorias.length === 0 && (
            <small className="text-muted">No hay categorías disponibles.</small>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100">Agregar Proveedor</button>
      </form>
    </>
  );
};

export default AddTab;