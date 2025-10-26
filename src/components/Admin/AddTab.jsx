// src/components/Admin/AddTab.jsx
import React, { useState, useRef, useEffect } from 'react';

const AddTab = ({ onAddProducto, onAddCategoria, onAddProveedor, proveedores = [], categorias = [] }) => {
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

  const [showCategoriaDropdown, setShowCategoriaDropdown] = useState(false);
  const [searchCategoria, setSearchCategoria] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCategoriaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (showCategoriaDropdown && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showCategoriaDropdown]);

  // ✅ CORREGIDO: solo cantidad y precio se convierten a número
  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto({
      ...nuevoProducto,
      [name]: ['cantidad', 'precio'].includes(name)
        ? value === '' ? '' : Number(value)
        : value // provider_id y categoria_id permanecen como strings
    });
  };

  const handleAddProductoSubmit = (e) => {
    e.preventDefault();
    const { id, nombre, categoria_id, cantidad, precio, provider_id } = nuevoProducto;
    if (!id || !nombre || !categoria_id || !cantidad || !precio || !provider_id) {
      alert('Por favor completa todos los campos del producto.');
      return;
    }
    onAddProducto({ ...nuevoProducto });
    setNuevoProducto({ id: '', nombre: '', categoria_id: '', cantidad: '', precio: '', provider_id: '' });
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
    setNuevoProveedor({ ...nuevoProveedor, [name]: value });
  };

  const toggleCategoria = (id) => {
    setNuevoProveedor(prev => {
      const categorias = prev.categorias;
      if (categorias.includes(id)) {
        return { ...prev, categorias: categorias.filter(c => c !== id) };
      } else {
        return { ...prev, categorias: [...categorias, id] };
      }
    });
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
    setSearchCategoria('');
    setShowCategoriaDropdown(false);
  };

  const listaProveedores = Array.isArray(proveedores) ? proveedores : [];
  const categoriasSeleccionadas = categorias
    .filter(cat => nuevoProveedor.categorias.includes(cat.id))
    .map(cat => cat.nombre);
  const categoriesFiltered = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(searchCategoria.trim().toLowerCase())
  );

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
          <select className="form-control" name="categoria_id" value={nuevoProducto.categoria_id} onChange={handleProductoChange} required>
            <option value="">Seleccionar categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
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

        <div className="mb-3" ref={dropdownRef} style={{ position: 'relative' }}>
          <label className="form-label">Categorías que surte</label>
          <button
            type="button"
            className="form-control text-start d-flex justify-content-between align-items-center"
            onClick={() => setShowCategoriaDropdown(s => !s)}
            style={{ cursor: 'pointer' }}
            aria-expanded={showCategoriaDropdown}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '85%' }}>
              {categoriasSeleccionadas.length > 0 ? categoriasSeleccionadas.join(', ') : 'Seleccionar categorías'}
            </span>
            <span style={{ marginLeft: '0.5rem' }}>▾</span>
          </button>

          {showCategoriaDropdown && (
            <div
              className="dropdown-menu show"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '240px',
                overflowY: 'auto',
                zIndex: 1000,
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '0.375rem',
                padding: '0.5rem'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <input
                  ref={searchRef}
                  type="search"
                  className="form-control"
                  placeholder="Buscar categoría..."
                  value={searchCategoria}
                  onChange={(e) => setSearchCategoria(e.target.value)}
                  aria-label="Buscar categoría"
                />
              </div>
              <div>
                {categoriesFiltered.length > 0 ? categoriesFiltered.map(cat => (
                  <div key={cat.id} className="form-check" style={{ margin: '0.25rem 0' }}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`cat-${cat.id}`}
                      checked={nuevoProveedor.categorias.includes(cat.id)}
                      onChange={() => toggleCategoria(cat.id)}
                    />
                    <label className="form-check-label" htmlFor={`cat-${cat.id}`}>
                      {cat.nombre}
                    </label>
                  </div>
                )) : (
                  <div className="text-muted" style={{ padding: '0.5rem' }}>No hay categorías.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100">Agregar Proveedor</button>
      </form>
    </>
  );
};

export default AddTab;