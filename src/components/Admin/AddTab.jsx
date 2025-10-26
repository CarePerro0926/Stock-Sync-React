import React, { useState } from 'react';

// Función para validar número de teléfono colombiano
const validarTelefonoColombiano = (telefono) => {
  // Expresión regular para números colombianos (10 dígitos, empiezan con 3)
  // Acepta formatos como 3123456789, 312 345 6789, 312.345.6789, +57 312 345 6789, etc.
  const regex = /^(\+?57)?\s?[3]\d{9}$/;
  // Remover espacios, guiones y paréntesis para la validación
  const numeroLimpio = telefono.replace(/\s|-|\(|\)/g, '');
  return regex.test(numeroLimpio);
};

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
    categoria: '', // ← ahora usamos 'categoria' (nombre), no 'categoria_id'
    cantidad: '',
    precio: '',
    proveedores: []
  });

  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    email: '',
    telefono: '', // Campo de teléfono
    productos: [],
    categorias: [] // ← guarda nombres de categorías, ej: ["Procesadores", "Boards"]
  });

  /* ---------- Producto ---------- */
  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({
      ...prev,
      [name]: ['cantidad', 'precio'].includes(name)
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
          ? prev.proveedores.filter((id) => id !== proveedorId)
          : [...prev.proveedores, proveedorId]
      };
    });
  };

  const handleAddProductoSubmit = (e) => {
    e.preventDefault();
    const { id, nombre, categoria, cantidad, precio, proveedores: provs } = nuevoProducto;
    if (!id || !nombre || !categoria || !cantidad || !precio || provs.length === 0) {
      alert('Por favor completa todos los campos e incluye al menos un proveedor.');
      return;
    }
    onAddProducto(nuevoProducto);
    setNuevoProducto({
      id: '',
      nombre: '',
      categoria: '',
      cantidad: '',
      precio: '',
      proveedores: []
    });
  };

  /* ---------- Categoría ---------- */
  const handleAddCategoriaSubmit = (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) {
      alert('Ingresa el nombre de la categoría.');
      return;
    }
    onAddCategoria(nuevaCategoria.trim());
    setNuevaCategoria('');
  };

  /* ---------- Proveedor ---------- */
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
          ? prev.productos.filter((id) => id !== productoId)
          : [...prev.productos, productoId]
      };
    });
  };

  const toggleCategoriaProveedor = (categoriaNombre) => {
    setNuevoProveedor((prev) => {
      const isSelected = prev.categorias.includes(categoriaNombre);
      return {
        ...prev,
        categorias: isSelected
          ? prev.categorias.filter((nombre) => nombre !== categoriaNombre)
          : [...prev.categorias, categoriaNombre]
      };
    });
  };

  const handleAddProveedorSubmit = (e) => {
    e.preventDefault();
    const { nombre, email, telefono, productos: prods, categorias: cats } = nuevoProveedor;

    // Validación de campos requeridos
    if (!nombre || !email || prods.length === 0 || cats.length === 0) {
      alert('Completa nombre, correo, al menos un producto y al menos una categoría.');
      return;
    }

    // Validación del teléfono si se ha ingresado
    if (telefono && telefono.trim() !== '') {
        if (!validarTelefonoColombiano(telefono)) {
            alert('Por favor ingresa un número de teléfono colombiano válido (10 dígitos, empieza con 3).');
            return;
        }
    } else {
        // Si se deja vacío, puedes permitirlo o pedirlo, aquí lo hago opcional, pero puedes cambiar la lógica
        // Si quieres que sea obligatorio, descomenta la línea debajo
        // alert('Por favor ingresa el número de teléfono del proveedor.');
        // return;
    }


    onAddProveedor({
      nombre,
      email,
      telefono, // Incluye el teléfono validado
      productos: prods,
      categorias: cats
    });
    setNuevoProveedor({
      nombre: '',
      email: '',
      telefono: '', // Limpia teléfono también
      productos: [],
      categorias: []
    });
  };

  return (
    <>
      {/* -------------------- Agregar Producto -------------------- */}
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
            name="categoria"
            value={nuevoProducto.categoria}
            onChange={handleProductoChange}
            required
          >
            <option value="">Seleccionar categoría</option>
            {categorias.length > 0 ? (
              categorias.map((cat) => (
                <option key={cat.nombre} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))
            ) : (
              <option value="" disabled>No hay categorías disponibles</option>
            )}
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
          <label className="form-label">Proveedores (selecciona uno o más)</label>
          <div className="d-flex flex-column gap-2 mt-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
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
      {/* -------------------- Agregar Categoría -------------------- */}
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
      {/* -------------------- Agregar Proveedor -------------------- */}
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
            placeholder="Teléfono (Colombia, 10 dígitos emp. con 3)"
            value={nuevoProveedor.telefono}
            onChange={handleProveedorChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Productos que surte (selecciona uno o más)</label>
          <div className="d-flex flex-column gap-2 mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
          <label className="form-label">Categorías que surte (selecciona una o más)</label> {/* Actualizado label */}
          <div className="d-flex flex-column gap-2 mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {categorias.length > 0 ? (
              categorias.map((cat) => (
                <div key={cat.nombre} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`prov-cat-${cat.nombre}`}
                    checked={nuevoProveedor.categorias.includes(cat.nombre)}
                    onChange={() => toggleCategoriaProveedor(cat.nombre)}
                  />
                  <label className="form-check-label" htmlFor={`prov-cat-${cat.nombre}`}>
                    {cat.nombre}
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