import React, { useState } from 'react';

const AddTab = ({
  onAddProducto,
  onAddCategoria,
  onAddProveedor,
  proveedores = [],
  categorias = []
}) => {
  const [nuevoProducto, setNuevoProducto] = useState({
    id: '',
    nombre: '',
    categoria_id: '',
    cantidad: '',
    precio: '',
    provider_id: ''
  });

  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    email: '',
    telefono: '',
    categorias: []
  });

  const handleProductoChange = (e) => {
    const { name, value } = e.target;

    setNuevoProducto((prev) => ({
      ...prev,
      [name]: ['cantidad', 'precio', 'provider_id', 'categoria_id'].includes(name)
        ? value === '' ? '' : Number(value)
        : value
    }));
  };

  const handleAddProductoSubmit = (e) => {
    e.preventDefault();

    const { id, nombre, categoria_id, cantidad, precio, provider_id } = nuevoProducto;

    if (!id || !nombre || !categoria_id || !cantidad || !precio || !provider_id) {
      alert('Completa todos los campos del producto.');
      return;
    }

    onAddProducto(nuevoProducto);

    setNuevoProducto({
      id: '',
      nombre: '',
      categoria_id: '',
      cantidad: '',
      precio: '',
      provider_id: ''
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

  const handleAddProveedorSubmit = (e) => {
    e.preventDefault();

    const { nombre, email, telefono, categorias } = nuevoProveedor;

    if (!nombre || !email || categorias.length === 0) {
      alert('Completa nombre, correo y al menos una categoría.');
      return;
    }

    onAddProveedor({ nombre, email, telefono, categorias });

    setNuevoProveedor({
      nombre: '',
      email: '',
      telefono: '',
      categorias: []
    });
  };

  return (
    <>
      {/* Agregar Producto */}
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

        <div className="mb-2">
          <select
            className="form-control"
            name="provider_id"
            value={nuevoProducto.provider_id}
            onChange={handleProductoChange}
            required
          >
            <option value="">Seleccionar proveedor</option>
            {proveedores.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.id} — {prov.nombre}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-success w-100">
          Agregar Producto
        </button>
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
            <button type="submit" className="btn btn-info w-100">
              Agregar Categoría
            </button>
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

        <div className="mb-3">
          <label className="form-label">Categorías que surte</label>

          <div className="d-flex flex-column gap-2 mt-2">
            {categorias.length > 0 ? (
              categorias.map((cat) => (
                <div key={cat.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`cat-${cat.id}`}
                    checked={nuevoProveedor.categorias.includes(cat.id)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;

                      setNuevoProveedor((prev) => {
                        if (isChecked) {
                          return {
                            ...prev,
                            categorias: [...prev.categorias, cat.id]
                          };
                        } else {
                          return {
                            ...prev,
                            categorias: prev.categorias.filter((id) => id !== cat.id)
                          };
                        }
                      });
                    }}
                  />

                  <label className="form-check-label" htmlFor={`cat-${cat.id}`}>
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