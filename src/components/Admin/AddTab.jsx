// src/components/Admin/AddTab.jsx
import React, { useState } from 'react';

const CATEGORIAS_PERMITIDAS = [
  'Procesadores',
  'Tarjetas Gráficas',
  'Memorias RAM',
  'Discos Duros',
  'Boards',
  'Fuentes de Poder',
  'Gabinetes',
  'Periféricos',
  'Monitores',
  'Refrigeración',
  'Redes',
  'Accesorios',
  'Mobiliario'
];

const AddTab = ({ onAddProducto, proveedores = [] }) => {
  const [nuevoProducto, setNuevoProducto] = useState({
    id: '',
    nombre: '',
    categoria: '',
    cantidad: '',
    precio: '',
    provider_id: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto({
      ...nuevoProducto,
      [name]: ['cantidad', 'precio', 'provider_id'].includes(name)
        ? value === '' ? '' : Number(value)
        : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { id, nombre, categoria, cantidad, precio, provider_id } = nuevoProducto;

    if (!id || !nombre || !categoria || !cantidad || !precio || !provider_id) {
      alert('Por favor completa todos los campos.');
      return;
    }

    onAddProducto(nuevoProducto);
    setNuevoProducto({ id: '', nombre: '', categoria: '', cantidad: '', precio: '', provider_id: '' });
  };

  // ✅ Asegúrate de que proveedores sea un array
  const listaProveedores = Array.isArray(proveedores) ? proveedores : [];

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-2">
        <input
          type="text"
          className="form-control"
          name="id"
          placeholder="ID"
          value={nuevoProducto.id}
          onChange={handleChange}
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
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-2">
        <select
          className="form-control"
          name="categoria"
          value={nuevoProducto.categoria}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar categoría</option>
          {CATEGORIAS_PERMITIDAS.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
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
          onChange={handleChange}
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
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-2">
        <select
          className="form-control"
          name="provider_id"
          value={nuevoProducto.provider_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar proveedor</option>
          {listaProveedores.length > 0 ? (
            listaProveedores.map(prov => (
              <option key={prov.id} value={prov.id}>
                {prov.nombre}
              </option>
            ))
          ) : (
            <option disabled>No hay proveedores</option>
          )}
        </select>
      </div>
      <button type="submit" className="btn btn-success w-100">
        Agregar Producto
      </button>
    </form>
  );
};

export default AddTab;