// src/components/Admin/UpdateTab.jsx
import React, { useState } from 'react';
import { supabase } from '@/services/supabaseClient';

const UpdateTab = ({ productos = [], categorias = [], proveedores = [], onUpdateSuccess }) => {
  // ---------- PRODUCTOS ----------
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
    return categorias.map(cat => ({ id: cat.id, nombre: cat.nombre }));
  };

  const handleBuscar = (e) => {
    e && e.preventDefault();
    const entrada = (busqueda || '').trim().toLowerCase();
    let encontrado = (productos || []).find(p => String(p.id).toLowerCase() === entrada);

    if (!encontrado) {
      encontrado = (productos || []).find(p => (p.nombre || '').toLowerCase() === entrada);
    }

    if (!encontrado && productoSeleccionado) {
      encontrado = (productos || []).find(p => String(p.id) === String(productoSeleccionado));
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
      precio: encontrado.precio ?? '',
      cantidad: encontrado.cantidad ?? '',
      categoria: encontrado.categoria_id ?? ''
    });
    setSugerencias([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();

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
        categoria_id: formData.categoria || null
      })
      .eq('id', producto.id);

    if (error) {
      alert('Error al actualizar el producto: ' + error.message);
      return;
    }

    if (onUpdateSuccess) {
      try { onUpdateSuccess(); } catch (e) { console.error(e); }
    }

    alert('Producto actualizado correctamente.');
    setBusqueda('');
    setProductoSeleccionado('');
    setProducto(null);
    setFormData({ nombre: '', precio: '', cantidad: '', categoria: '' });
  };

  const listaCategorias = getListaCategorias();

  // ---------- PROVEEDORES (misma UX que PRODUCTOS) ----------
  const [busquedaProv, setBusquedaProv] = useState('');
  const [sugerenciasProv, setSugerenciasProv] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [proveedor, setProveedor] = useState(null);
  const [formProv, setFormProv] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });

  const handleBuscarProv = (e) => {
    e && e.preventDefault();
    const entrada = (busquedaProv || '').trim().toLowerCase();
    let encontrado = (proveedores || []).find(p => String(p.id).toLowerCase() === entrada);

    if (!encontrado) {
      encontrado = (proveedores || []).find(p => (p.nombre || '').toLowerCase() === entrada);
    }
    if (!encontrado) {
      encontrado = (proveedores || []).find(p => (p.email || '').toLowerCase() === entrada);
    }

    if (!encontrado && proveedorSeleccionado) {
      encontrado = (proveedores || []).find(p => String(p.id) === String(proveedorSeleccionado));
    }

    if (!encontrado) {
      alert('Proveedor no encontrado.');
      setProveedor(null);
      setFormProv({ nombre: '', email: '', telefono: '' });
      return;
    }

    setProveedor(encontrado);
    setFormProv({
      nombre: encontrado.nombre || '',
      email: encontrado.email || '',
      telefono: encontrado.telefono || ''
    });
    setSugerenciasProv([]);
  };

  const handleChangeProv = (e) => {
    const { name, value } = e.target;
    setFormProv(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitProv = async (e) => {
    e && e.preventDefault();

    if (!proveedor || !proveedor.id) {
      alert('Proveedor no válido. Primero búscalo correctamente.');
      return;
    }

    if (!formProv.nombre.trim()) {
      alert('Nombre de proveedor inválido.');
      return;
    }
    if (!formProv.email.trim() || !/^\S+@\S+\.\S+$/.test(formProv.email)) {
      alert('Email de proveedor inválido.');
      return;
    }

    const { error } = await supabase
      .from('proveedores')
      .update({
        nombre: formProv.nombre.trim(),
        email: formProv.email.trim(),
        telefono: formProv.telefono ? formProv.telefono.trim() : null
      })
      .eq('id', proveedor.id);

    if (error) {
      alert('Error al actualizar el proveedor: ' + error.message);
      return;
    }

    if (onUpdateSuccess) {
      try { onUpdateSuccess(); } catch (e) { console.error(e); }
    }

    alert('Proveedor actualizado correctamente.');
    setBusquedaProv('');
    setProveedorSeleccionado('');
    setProveedor(null);
    setFormProv({ nombre: '', email: '', telefono: '' });
  };

  return (
    <>
      {/* ---------- PRODUCTOS ---------- */}
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

                const texto = (entrada || '').trim().toLowerCase();
                if (texto.length === 0) {
                  setSugerencias([]);
                  return;
                }

                const coincidencias = (productos || []).filter(p =>
                  (p.nombre || '').toLowerCase().includes(texto) ||
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
                        precio: p.precio ?? '',
                        cantidad: p.cantidad ?? '',
                        categoria: p.categoria_id ?? ''
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
            <button type="submit" className="btn btn-outline-primary w-100">Buscar</button>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">O selecciona un producto</label>
          <select
            className="form-select"
            value={productoSeleccionado}
            onChange={(e) => {
              const val = e.target.value;
              setProductoSeleccionado(val);
              const encontrado = (productos || []).find(p => String(p.id) === String(val));
              if (encontrado) {
                setProducto(encontrado);
                setFormData({
                  nombre: encontrado.nombre || '',
                  precio: encontrado.precio ?? '',
                  cantidad: encontrado.cantidad ?? '',
                  categoria: encontrado.categoria_id ?? ''
                });
              } else {
                setProducto(null);
                setFormData({ nombre: '', precio: '', cantidad: '', categoria: '' });
              }
            }}
          >
            <option value="">—</option>
            {(productos || []).map(p => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </form>

      {producto && (
        <form onSubmit={handleSubmit}>
          <div className="row g-2 mb-3">
            <div className="col-12">
              <label className="form-label">Nombre</label>
              <input name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Precio</label>
              <input name="precio" type="number" step="0.01" className="form-control" value={formData.precio} onChange={handleChange} required />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Cantidad</label>
              <input name="cantidad" type="number" className="form-control" value={formData.cantidad} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <label className="form-label">Categoría</label>
              <select name="categoria" className="form-select" value={formData.categoria} onChange={handleChange} required>
                <option value="">Selecciona una categoría</option>
                {listaCategorias.map(cat => (<option key={cat.id} value={cat.id}>{cat.nombre}</option>))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn w-100 text-white" style={{ backgroundColor: '#0F2C54', borderColor: '#0F2C54' }}>
            Actualizar Producto
          </button>
        </form>
      )}

      {/* ---------- PROVEEDORES ---------- */}
      <h5 className="mt-5">Actualizar Proveedor</h5>

      <form onSubmit={handleBuscarProv} className="mb-4">
        <div className="row g-2 mb-2">
          <div className="col-12 col-md-8 position-relative">
            <input
              className="form-control"
              placeholder="Buscar por ID, nombre o email"
              value={busquedaProv}
              onChange={(e) => {
                const entrada = e.target.value;
                setBusquedaProv(entrada);

                const texto = (entrada || '').trim().toLowerCase();
                if (texto.length === 0) {
                  setSugerenciasProv([]);
                  return;
                }

                const coincidencias = (proveedores || []).filter(p =>
                  (p.nombre || '').toLowerCase().includes(texto) ||
                  (p.email || '').toLowerCase().includes(texto) ||
                  String(p.id).toLowerCase().includes(texto)
                );

                setSugerenciasProv(coincidencias.slice(0, 5));
              }}
            />

            {busquedaProv && sugerenciasProv.length > 0 && (
              <ul className="list-group position-absolute z-3 w-100">
                {sugerenciasProv.map(p => (
                  <li
                    key={p.id}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setProveedor(p);
                      setFormProv({
                        nombre: p.nombre || '',
                        email: p.email || '',
                        telefono: p.telefono || ''
                      });
                      setBusquedaProv(`${p.id} - ${p.nombre} - ${p.email}`);
                      setSugerenciasProv([]);
                    }}
                  >
                    {p.id} - {p.nombre} - {p.email}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-12 col-md-4">
            <button type="submit" className="btn btn-outline-primary w-100">Buscar</button>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">O selecciona un proveedor</label>
          <select
            className="form-select"
            value={proveedorSeleccionado}
            onChange={(e) => {
              const val = e.target.value;
              setProveedorSeleccionado(val);
              const encontrado = (proveedores || []).find(p => String(p.id) === String(val));
              if (encontrado) {
                setProveedor(encontrado);
                setFormProv({
                  nombre: encontrado.nombre || '',
                  email: encontrado.email || '',
                  telefono: encontrado.telefono || ''
                });
              } else {
                setProveedor(null);
                setFormProv({ nombre: '', email: '', telefono: '' });
              }
            }}
          >
            <option value="">—</option>
            {(proveedores || []).map(p => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.nombre} - {p.email}
              </option>
            ))}
          </select>
        </div>
      </form>

      {proveedor && (
        <form onSubmit={handleSubmitProv}>
          <div className="row g-2 mb-3">
            <div className="col-12">
              <label className="form-label">Nombre</label>
              <input name="nombre" className="form-control" value={formProv.nombre} onChange={handleChangeProv} required />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Email</label>
              <input name="email" type="email" className="form-control" value={formProv.email} onChange={handleChangeProv} required />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Teléfono</label>
              <input name="telefono" className="form-control" value={formProv.telefono} onChange={handleChangeProv} />
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