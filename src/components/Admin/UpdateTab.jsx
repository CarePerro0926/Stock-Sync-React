// src/components/Admin/UpdateTab.jsx
import React, { useState } from 'react';
import { supabase } from '@/services/supabaseClient';

const UpdateTab = ({ productos, categorias, proveedores = [], onUpdateSuccess }) => {
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

    if (onUpdateSuccess) onUpdateSuccess();

    alert('Producto actualizado correctamente.');
    setBusqueda('');
    setProductoSeleccionado('');
    setProducto(null);
    setFormData({ nombre: '', precio: '', cantidad: '', categoria: '' });
  };

  const listaCategorias = getListaCategorias();

  // ---------- PROVEEDORES ----------
  const [busquedaProv, setBusquedaProv] = useState('');
  const [sugerenciasProv, setSugerenciasProv] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [proveedor, setProveedor] = useState(null);
  const [formProv, setFormProv] = useState({
    nombre: '',
    correo: '',
    telefono: ''
  });

  const handleBuscarProv = (e) => {
    e.preventDefault();
    const entrada = busquedaProv.trim().toLowerCase();
    let encontrado = proveedores.find(p => String(p.id).toLowerCase() === entrada);

    if (!encontrado) {
      encontrado = proveedores.find(p => (p.nombre || '').toLowerCase() === entrada);
    }
    if (!encontrado) {
      encontrado = proveedores.find(p => (p.correo || '').toLowerCase() === entrada);
    }

    if (!encontrado && proveedorSeleccionado) {
      encontrado = proveedores.find(p => String(p.id) === proveedorSeleccionado);
    }

    if (!encontrado) {
      alert('Proveedor no encontrado.');
      setProveedor(null);
      setFormProv({ nombre: '', correo: '', telefono: '' });
      return;
    }

    setProveedor(encontrado);
    setFormProv({
      nombre: encontrado.nombre || '',
      correo: encontrado.correo || '',
      telefono: encontrado.telefono || ''
    });
    setSugerenciasProv([]);
  };

  const handleChangeProv = (e) => {
    const { name, value } = e.target;
    setFormProv(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitProv = async (e) => {
    e.preventDefault();

    if (!proveedor || !proveedor.id) {
      alert('Proveedor no válido. Primero búscalo correctamente.');
      return;
    }

    // Validaciones básicas
    if (!formProv.nombre.trim()) {
      alert('Nombre de proveedor inválido.');
      return;
    }
    if (!formProv.correo.trim() || !/^\S+@\S+\.\S+$/.test(formProv.correo)) {
      alert('Correo de proveedor inválido.');
      return;
    }

    const { error } = await supabase
      .from('proveedores')
      .update({
        nombre: formProv.nombre.trim(),
        correo: formProv.correo.trim(),
        telefono: formProv.telefono.trim()
      })
      .eq('id', proveedor.id);

    if (error) {
      alert('Error al actualizar el proveedor: ' + error.message);
      return;
    }

    if (onUpdateSuccess) onUpdateSuccess();

    alert('Proveedor actualizado correctamente.');
    setBusquedaProv('');
    setProveedorSeleccionado('');
    setProveedor(null);
    setFormProv({ nombre: '', correo: '', telefono: '' });
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

                const texto = entrada.trim().toLowerCase();
                if (texto.length === 0) {
                  setSugerencias([]);
                  return;
                }

                const coincidencias = productos.filter(p =>
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
        <form onSubmit={handleSubmit}>
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

      {/* ---------- PROVEEDORES ---------- */}
      <h5 className="mt-5">Actualizar Proveedor</h5>

      <form onSubmit={handleBuscarProv} className="mb-4">
        <div className="row g-2 mb-2">
          <div className="col-12 col-md-8 position-relative">
            <input
              className="form-control"
              placeholder="Buscar por nombre o correo"
              value={busquedaProv}
              onChange={(e) => {
                const entrada = e.target.value;
                setBusquedaProv(entrada);

                const texto = entrada.trim().toLowerCase();
                if (texto.length === 0) {
                  setSugerenciasProv([]);
                  return;
                }

                const coincidencias = proveedores.filter(p =>
                  (p.nombre || '').toLowerCase().includes(texto) ||
                  (p.correo || '').toLowerCase().includes(texto) ||
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
                        correo: p.correo || '',
                        telefono: p.telefono || ''
                      });
                      setBusquedaProv(`${p.nombre} - ${p.correo}`);
                      setSugerenciasProv([]);
                    }}
                  >
                    {p.nombre} - {p.correo}
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
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} - {p.correo}
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
              <input
                name="nombre"
                className="form-control"
                value={formProv.nombre}
                onChange={handleChangeProv}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Correo</label>
              <input
                name="correo"
                type="email"
                className="form-control"
                value={formProv.correo}
                onChange={handleChangeProv}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Teléfono</label>
              <input
                name="telefono"
                className="form-control"
                value={formProv.telefono}
                onChange={handleChangeProv}
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