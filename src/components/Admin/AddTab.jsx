// src/components/Admin/AddTab.jsx
import React, { useState } from 'react';
import MultiSelectDropdown from '../MultiSelectDropdown';

const validarTelefonoColombiano = (telefono) => {
  if (!telefono || telefono.trim() === '') return true;
  const regex = /^(\+?57)?\s?[3]\d{9}$/;
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
    categoria: '',
    cantidad: '',
    precio: '',
    proveedores: []
  });

  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    email: '',
    telefono: '',
    productos: [],
    categorias: []
  });

  const [selectedProveedores, setSelectedProveedores] = useState([]);
  const [productosQueSurte, setProductosQueSurte] = useState([]);
  const [categoriasQueSurte, setCategoriasQueSurte] = useState([]);

  /* ---------- Handlers Producto ---------- */
  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({
      ...prev,
      [name]: ['cantidad', 'precio'].includes(name)
        ? value === '' ? '' : Number(value)
        : value
    }));
  };

  const handleAddProductoSubmit = (e) => {
    e.preventDefault();
    const { id, nombre, categoria, cantidad, precio } = nuevoProducto;

    const provs = proveedores
      .filter(p => selectedProveedores.includes(p.nombre))
      .map(p => p.id);

    if (!id || !nombre || !categoria || cantidad === '' || precio === '' || provs.length === 0) {
      alert('Por favor completa todos los campos e incluye al menos un proveedor.');
      return;
    }

    if (onAddProducto) {
      onAddProducto({
        ...nuevoProducto,
        proveedores: provs
      });
    }

    setNuevoProducto({
      id: '',
      nombre: '',
      categoria: '',
      cantidad: '',
      precio: '',
      proveedores: []
    });
    setSelectedProveedores([]);
  };

  /* ---------- Handlers Categoría ---------- */
  const handleAddCategoriaSubmit = (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) {
      alert('Ingresa el nombre de la categoría.');
      return;
    }
    if (onAddCategoria) {
      onAddCategoria(nuevaCategoria.trim());
    }
    setNuevaCategoria('');
  };

  /* ---------- Handlers Proveedor ---------- */
  const handleProveedorChange = (e) => {
    const { name, value } = e.target;
    setNuevoProveedor((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProveedorSubmit = (e) => {
    e.preventDefault();
    const { nombre, email, telefono } = nuevoProveedor;

    const productosSeleccionados = productos
      .filter(p => productosQueSurte.includes(p.nombre))
      .map(p => p.id);

    const categoriasSeleccionadas = categorias
      .filter(c => categoriasQueSurte.includes(c.nombre))
      .map(c => c.nombre);

    if (!nombre || !email || productosSeleccionados.length === 0 || categoriasSeleccionadas.length === 0) {
      alert('Completa nombre, correo, al menos un producto y al menos una categoría.');
      return;
    }

    if (telefono && telefono.trim() !== '') {
      if (!validarTelefonoColombiano(telefono)) {
        alert('Por favor ingresa un número de teléfono colombiano válido.');
        return;
      }
    }

    if (onAddProveedor) {
      onAddProveedor({
        nombre,
        email,
        telefono,
        productos: productosSeleccionados,
        categorias: categoriasSeleccionadas
      });
    }

    setNuevoProveedor({
      nombre: '',
      email: '',
      telefono: '',
      productos: [],
      categorias: []
    });
    setProductosQueSurte([]);
    setCategoriasQueSurte([]);
  };

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
      
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
            {categorias.map((cat) => (
              <option key={cat.nombre} value={cat.nombre}>
                {cat.nombre}
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
        <MultiSelectDropdown
          label="Proveedores (selecciona uno o más)"
          options={proveedores.map(p => p.nombre)}
          selected={selectedProveedores}
          onChange={setSelectedProveedores}
        />
        <div className="mt-3">
          <button type="submit" className="btn w-100 text-white" style={{ backgroundColor: '#0F2C54', borderColor: '#0F2C54' }}>
            Agregar Producto
          </button>
        </div>
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
            <button type="submit" className="btn w-100 text-white" style={{ backgroundColor: '#0F2C54', borderColor: '#0F2C54' }}>
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
        <MultiSelectDropdown
          label="Productos que surte (selecciona uno o más)"
          options={productos.map(p => p.nombre)}
          selected={productosQueSurte}
          onChange={setProductosQueSurte}
        />
        <MultiSelectDropdown
          label="Categorías que surte (selecciona una o más)"
          options={categorias.map(c => c.nombre)}
          selected={categoriasQueSurte}
          onChange={setCategoriasQueSurte}
        />
        <div className="mt-3 mb-2">
          <button type="submit" className="btn w-100 text-white" style={{ backgroundColor: '#0F2C54', borderColor: '#0F2C54' }}>
            Agregar Proveedor
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTab;
