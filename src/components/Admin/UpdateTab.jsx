// src/components/Admin/UpdateTab.jsx
import React, { useState } from 'react';
import { supabase } from '@/services/supabaseClient';

const UpdateTab = ({ productos, categorias, onUpdateSuccess }) => {
  const [busqueda, setBusqueda] = useState('');
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
      onUpdateSuccess(); // 🔁 sincroniza el estado global
    }

    alert('Producto actualizado correctamente.');
    setBusqueda('');
    setProductoSeleccionado('');
    setProducto(null);
    setFormData({ nombre: '', precio: '', cantidad: '', categoria: '' });
  };

  const listaCategorias = getListaCategorias();

  return (
    <>
      <h5>Actualizar Producto</h5>

      <form onSubmit={handleBuscar} className="mb-4">
        <div className="row g-2 mb-2">
          <div className="col-12 col-md-8">
            <input
              className="form-control"
              placeholder="Buscar por ID o nombre"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
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
    </>
  );
};

export default UpdateTab;