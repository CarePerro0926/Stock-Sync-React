// src/components/Admin/UpdateTab.jsx
import React, { useState } from 'react';
import { supabase } from '@/services/supabaseClient';

const UpdateTab = ({ productos, categorias, proveedores, onUpdateSuccess, onUpdateProveedorSuccess }) => {
  // ---------------------- Estado: Productos ----------------------
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [producto, setProducto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    cantidad: '',
    categoria: ''
  });

  const getListaCategorias = () => {
    if (!categorias || !Array.isArray(categorias)) return [];
    return categorias.map(cat => ({
      id: cat.id,
      nombre: cat.nombre
    }));
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    const entrada = busqueda.trim().toLowerCase();
    let encontrado = productos.find(p => String(p.id).toLowerCase() === entrada);

    if (!encontrado) {
      encontrado = productos.find(p => p.nombre.toLowerCase() === entrada);
    }

    if (!encontrado && productoSeleccionado) {
      encontrado = productos.find(p => String(p.id) === productoSeleccionado);
    }

    if (!encontrado) {
      alert('Producto no encontrado.');
      setProducto(null);
      setFormData({ nombre: '', precio: '', cantidad: '', categoria: '' });
      return;
    }

    setProducto(encontrado);
    setFormData({
      nombre: encontrado.nombre || '',
      precio: encontrado.precio || '',
      cantidad: encontrado.cantidad || '',
      categoria: encontrado.categoria_id || ''
    });
    setSugerencias([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!producto || !producto.id) {
      alert('Producto no válido. Primero búscalo correctamente.');
      return;
    }

    const precio = parseFloat(formData.precio);
    const cantidad = parseInt(formData.cantidad, 10);

    if (isNaN(precio) || precio < 0) {
      alert('Precio inválido.');
      return;
    }
    if (isNaN(cantidad) || cantidad < 0) {
      alert('Cantidad inválida.');
      return;
    }

    const { error } = await supabase
      .from('productos')
      .update({
        nombre: formData.nombre.trim(),
        precio,
        cantidad,
        categoria_id: formData.categoria
      })
      .eq('id', producto.id);

    if (error) {
      alert('Error al actualizar el producto: ' + error.message);
      return;
    }

    if (onUpdateSuccess) {
      onUpdateSuccess();
    }

    alert('Producto actualizado correctamente.');
    setBusqueda('');
    setProductoSeleccionado('');
    setProducto(null);
    setFormData({ nombre: '', precio: '', cantidad: '', categoria: '' });
  };

  const listaCategorias = getListaCategorias();

  // ---------------------- Estado: Proveedores ----------------------
  const [busquedaProv, setBusquedaProv] = useState('');
  const [sugerenciasProv, setSugerenciasProv] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [proveedor, setProveedor] = useState(null);
  const [formProvData, setFormProvData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  const getListaProveedores = () => {
    if (!proveedores || !Array.isArray(proveedores)) return [];
    return proveedores.map(pr => ({
      id: pr.id,
      nombre: pr.nombre,
      email: pr.email || ''
    }));
  };

  const handleBuscarProveedor = (e) => {
    e.preventDefault();
    const entrada = busquedaProv.trim().toLowerCase();
    let encontrado =
      proveedores.find(pr => String(pr.id).toLowerCase() === entrada) ||
      proveedores.find(pr => (pr.nombre || '').toLowerCase() === entrada) ||
      proveedores.find(pr => (pr.email || '').toLowerCase() === entrada);

    if (!encontrado && proveedorSeleccionado) {
      encontrado = proveedores.find(pr => String(pr.id) === proveedorSeleccionado);
    }

    if (!encontrado) {
      alert('Proveedor no encontrado.');
      setProveedor(null);
      setFormProvData({ nombre: '', email: '', telefono: '', direccion: '' });
      return;
    }

    setProveedor(encontrado);
    setFormProvData({
      nombre: encontrado.nombre || '',
      email: encontrado.email || '',
      telefono: encontrado.telefono || '',
      direccion: encontrado.direccion || ''
    });
    setSugerenciasProv([]);
  };

  const handleProvChange = (e) => {
    const { name, value } = e.target;
    setFormProvData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitProveedor = async (e) => {
    e.preventDefault();

    if (!proveedor || !proveedor.id) {
      alert('Proveedor no válido. Primero búscalo correctamente.');
      return;
    }

    // Validaciones básicas
    const email = (formProvData.email || '').trim();
    const nombre = (formProvData.nombre || '').trim();
    const telefono = (formProvData.telefono || '').trim();
    const direccion = (formProvData.direccion || '').trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      alert('Email inválido.');
      return;
    }

    // Si manejas numérico para teléfono, puedes validar:
    if (telefono && !/^[0-9+\-\s()]{7,}$/.test(telefono)) {
      alert('Teléfono inválido.');
      return;
    }

    const { error } = await supabase
      .from('proveedores')
      .update({
        nombre,
        email,
        telefono,
        direccion
      })
      .eq('id', proveedor.id);

    if (error) {
      alert('Error al actualizar el proveedor: ' + error.message);
      return;
    }

    if (onUpdateProveedorSuccess) {
      onUpdateProveedorSuccess();
    }

    alert('Proveedor actualizado correctamente.');
    setBusquedaProv('');
    setProveedorSeleccionado('');
    setProveedor(null);
    setFormProvData({ nombre: '', email: '', telefono: '', direccion: '' });
  };

  const listaProveedores = getListaProveedores();

  return (
    <>
      {/* ---------------------- Sección: Actualizar Producto ---------------------- */}
      <h5>Actualizar Producto</h5>

      <form onSubmit={handleBuscar} className="mb-4">
        <div className="row g-2 mb-2">
          <div className="col-12 col-md-8 position-relative">
            <input
              className="form-control"
              placeholder="Buscar por ID o nombre"
              value={busqueda}
              onChange={(e) => {
                const entrada = e.target.value;
                setBusqueda(entrada);

                const texto = entrada.trim().toLowerCase();
                if (texto.length === 0) {
                  setSugerencias([]);
                  return;
                }

                const coincidencias = productos.filter(p =>
                  p.nombre.toLowerCase().includes(texto) ||
                  String(p.id).toLowerCase().includes(texto)
                );

                setSugerencias(coincidencias.slice(0, 5));
              }}
            />

            {busqueda && sugerencias.length > 0 && (
              <ul className="list-group position-absolute z-3 w-100">
                {sugerencias.map(p => (
                  <li
                    key={p.id}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setProducto(p);
                      setFormData({
                        nombre: p.nombre || '',
                        precio: p.precio || '',
                        cantidad: p.cantidad || '',
                        categoria: p.categoria_id || ''
                      });
                      setBusqueda(`${p.id} - ${p.nombre}`);
                      setSugerencias([]);
                    }}
                  >
                    {p.id} - {p.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-12 col-md-4">
            <button type="submit" className="btn btn-outline-primary w-100">
              Buscar
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">O selecciona un producto</label>
          <select
            className="form-select"
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
          >
            <option value="">—</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </form>

      {producto && (
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="row g-2 mb-3">
            <div className="col-12">
              <label className="form-label">Nombre</label>
              <input
                name="nombre"
                className="form-control"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Precio</label>
              <input
                name="precio"
                type="number"
                step="0.01"
                className="form-control"
                value={formData.precio}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Cantidad</label>
              <input
                name="cantidad"
                type="number"
                className="form-control"
                value={formData.cantidad}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Categoría</label>
              <select
                name="categoria"
                className="form-select"
                value={formData.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una categoría</option>
                {listaCategorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn w-100 text-white" style={{ backgroundColor: '#0F2C54', borderColor: '#0F2C54' }}>
            Actualizar Producto
          </button>
        </form>
      )}

      {/* ---------------------- Sección: Actualizar Proveedor ---------------------- */}
      <h5>Actualizar Proveedor</h5>

      <form onSubmit={handleBuscarProveedor} className="mb-4">
        <div className="row g-2 mb-2">
          <div className="col-12 col-md-8 position-relative">
            <input
              className="form-control"
              placeholder="Buscar por ID, nombre o email"
              value={busquedaProv}
              onChange={(e) => {
                const entrada = e.target.value;
                setBusquedaProv(entrada);

                const texto = entrada.trim().toLowerCase();
                if (texto.length === 0) {
                  setSugerenciasProv([]);
                  return;
                }

                const coincidencias = proveedores.filter(pr =>
                  (pr.nombre || '').toLowerCase().includes(texto) ||
                  (pr.email || '').toLowerCase().includes(texto) ||
                  String(pr.id).toLowerCase().includes(texto)
                );

                setSugerenciasProv(coincidencias.slice(0, 5));
              }}
            />

            {busquedaProv && sugerenciasProv.length > 0 && (
              <ul className="list-group position-absolute z-3 w-100">
                {sugerenciasProv.map(pr => (
                  <li
                    key={pr.id}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setProveedor(pr);
                      setFormProvData({
                        nombre: pr.nombre || '',
                        email: pr.email || '',
                        telefono: pr.telefono || '',
                        direccion: pr.direccion || ''
                      });
                      const etiqueta = `${pr.id} - ${pr.nombre}${pr.email ? ' - ' + pr.email : ''}`;
                      setBusquedaProv(etiqueta);
                      setSugerenciasProv([]);
                    }}
                  >
                    {pr.id} - {pr.nombre}{pr.email ? ` - ${pr.email}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-12 col-md-4">
            <button type="submit" className="btn btn-outline-primary w-100">
              Buscar
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">O selecciona un proveedor</label>
          <select
            className="form-select"
            value={proveedorSeleccionado}
            onChange={(e) => setProveedorSeleccionado(e.target.value)}
          >
            <option value="">—</option>
            {listaProveedores.map(pr => (
              <option key={pr.id} value={pr.id}>
                {pr.id} - {pr.nombre}{pr.email ? ` - ${pr.email}` : ''}
              </option>
            ))}
          </select>
        </div>
      </form>

      {proveedor && (
        <form onSubmit={handleSubmitProveedor}>
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Nombre</label>
              <input
                name="nombre"
                className="form-control"
                value={formProvData.nombre}
                onChange={handleProvChange}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-control"
                value={formProvData.email}
                onChange={handleProvChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Teléfono</label>
              <input
                name="telefono"
                className="form-control"
                value={formProvData.telefono}
                onChange={handleProvChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Dirección</label>
              <input
                name="direccion"
                className="form-control"
                value={formProvData.direccion}
                onChange={handleProvChange}
              />
            </div>
          </div>
          <button type="submit" className="btn w-100 text-white" style={{ backgroundColor: '#0F2C54', borderColor: '#0F2C54' }}>
            Actualizar Proveedor
          </button>
        </form>
      )}
    </>
  );
};

export default UpdateTab;
