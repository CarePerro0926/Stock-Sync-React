// src/components/AddTab.js (o donde lo tengas)

import React, { useState } from 'react';

const AddTab = ({
  onAddProducto,
  onAddCategoria,
  onAddProveedor,
  proveedores = [],
  categorias = [],
  productos = []
}) => {
  const [nuevoProducto, setNuevoProducto] = useState({
    id: '',
    nombre: '',
    categoria_id: '',
    cantidad: '',
    precio: '',
    proveedores: []
  });

    const [nuevoProveedor, setNuevoProveedor] = useState({
      nombre: '',
      email: '',
      telefono: '',
      productos: [],
      categorias: [] // ✅ necesario para checkboxes
    });

  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({
      ...prev,
      [name]: ['cantidad', 'precio', 'categoria_id'].includes(name)
        ? value === '' ? '' : Number(value)
        : value
    }));
  };

  const toggleProveedorProducto = (proveedorId) => {
    setNuevoProducto((prev) => {
      const isSelected = prev.proveedores.includes(proveedorId);
      return {
        ...prev,
        proveedores: isSelected
          ? prev.proveedores.filter(id => id !== proveedorId)
          : [...prev.proveedores, proveedorId]
      };
    });
  };

  const handleAddProductoSubmit = (e) => {
    e.preventDefault();
    const { id, nombre, categoria_id, cantidad, precio, proveedores } = nuevoProducto;

    if (!id || !nombre || !categoria_id || !cantidad || !precio || proveedores.length === 0) {
      alert('Por favor completa todos los campos e incluye al menos un proveedor.');
      return;
    }

    onAddProducto(nuevoProducto);

    setNuevoProducto({
      id: '',
      nombre: '',
      categoria_id: '',
      cantidad: '',
      precio: '',
      proveedores: []
    });
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

  const handleProveedorChange = (e) => {
    const { name, value } = e.target;
    setNuevoProveedor((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleProductoProveedor = (productoId) => {
    setNuevoProveedor((prev) => {
      const isSelected = prev.productos.includes(productoId);
      return {
        ...prev,
        productos: isSelected
          ? prev.productos.filter(id => id !== productoId)
          : [...prev.productos, productoId]
      };
    });
  };

  const handleAddProveedorSubmit = (e) => {
    e.preventDefault();
    const { nombre, email, telefono, productos } = nuevoProveedor;

    if (!nombre || !email || productos.length === 0 || categorias.length === 0) {
  alert('Completa nombre, correo, al menos un producto y una categoría.');
  return;
}

    onAddProveedor({ nombre, email, telefono, productos });

    setNuevoProveedor({
      nombre: '',
      email: '',
      telefono: '',
      productos: []
    });
  };

  return (
    <>
      <h5>Agregar Producto</h5>
      <form onSubmit={handleAddProductoSubmit} className="mb-4">
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            name="id"
            placeholder="ID"
            value={nuevoProducto.id}
            onChange={handleProductoChange}
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            name="nombre"
            placeholder="Nombre"
            value={nuevoProducto.nombre}
            onChange={handleProductoChange}
            required
          />
        </div>
        <div className="mb-2">
        <select
          className="form-control"
          name="categoria_id"
          value={nuevoProducto.categoria_id}
          onChange={handleProductoChange}
          required
        >
          <option value="">Seleccionar categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.id} — {cat.nombre}
            </option>
          ))}
        </select>
        </div>
        <div className="mb-2">
          <input
            type="number"
            className="form-control"
            name="cantidad"
            placeholder="Cantidad"
            value={nuevoProducto.cantidad}
            onChange={handleProductoChange}
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="number"
            className="form-control"
            name="precio"
            placeholder="Precio"
            value={nuevoProducto.precio}
            onChange={handleProductoChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Proveedores</label>
          <div className="d-flex flex-column gap-2 mt-2">
            {proveedores.length > 0 ? (
              proveedores.map((prov) => (
                <div key={prov.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`prov-${prov.id}`}
                    checked={nuevoProducto.proveedores.includes(prov.id)}
                    onChange={() => toggleProveedorProducto(prov.id)}
                  />
                  <label className="form-check-label" htmlFor={`prov-${prov.id}`}>
                    {prov.nombre}
                  </label>
                </div>
              ))
            ) : (
              <small className="text-muted">No hay proveedores disponibles.</small>
            )}
          </div>
        </div>
        <button type="submit" className="btn btn-success w-100">
          Agregar Producto
        </button>
      </form>

      <hr className="my-4" />

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
            <button type="submit" className="btn btn-info w-100">
              Agregar Categoría
            </button>
          </div>
        </div>
      </form>

      <hr className="my-4" />

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
        <div className="mb-3">
          <label className="form-label">Productos que surte</label>
          <div
            className="d-flex flex-column gap-2 mt-2"
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          >
            {productos.length > 0 ? (
              productos.map((prod) => (
                <div key={prod.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`prov-prod-${prod.id}`}
                    checked={nuevoProveedor.productos.includes(prod.id)}
                    onChange={() => toggleProductoProveedor(prod.id)}
                  />
                  <label className="form-check-label" htmlFor={`prov-prod-${prod.id}`}>
                    {prod.nombre}
                  </label>
                </div>
              ))
            ) : (
              <small className="text-muted">No hay productos disponibles.</small>
            )}
          </div>
        </div>
        <div className="mb-3">
  <label className="form-label">Categorías que surte</label>
  <div className="d-flex flex-column gap-2 mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
    {categorias.length > 0 ? (
      categorias.map((cat) => (
        <div key={cat.id} className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id={`prov-cat-${cat.id}`}
            checked={nuevoProveedor.categorias?.includes?.(cat.id) || false}
            onChange={(e) => {
              const isChecked = e.target.checked;
              setNuevoProveedor((prev) => ({
                ...prev,
                categorias: isChecked
                  ? [...(prev.categorias || []), cat.id]
                  : (prev.categorias || []).filter((id) => id !== cat.id)
              }));
            }}
          />
          <label className="form-check-label" htmlFor={`prov-cat-${cat.id}`}>
            {cat.id} — {cat.nombre}
          </label>
        </div>
      ))
    ) : (
      <small className="text-muted">No hay categorías disponibles.</small>
    )}
  </div>
</div>
        <button type="submit" className="btn btn-primary w-100">
          Agregar Proveedor
        </button>
      </form>
    </>
  );
};

export default AddTab;