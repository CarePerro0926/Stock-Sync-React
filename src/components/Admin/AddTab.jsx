// src/components/Admin/AddTab.js
import React, { useState } from 'react';

const AddTab = ({ onAddProducto }) => {
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    categoria: '',
    cantidad: '',
    precio: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const producto = {
      ...formData,
      cantidad: parseInt(formData.cantidad) || 0,
      precio: parseInt(formData.precio) || 0
    };

    if (!producto.id || !producto.nombre || !producto.categoria || producto.cantidad < 0 || producto.precio < 0) {
      alert('Completa todos los campos correctamente.');
      return;
    }

    // Validar si ID ya existe
    if (producto.id && producto.id.trim() !== '') {
        // const productosExistentes = JSON.parse(JSON.stringify(formData)); // Simula getInventario()
        // if (productosExistentes.some(p => p.id === producto.id)) { // Simula getInventario()
        //     alert('ID ya existe');
        //     return;
        // }
        // Usamos el estado global de productos para verificar
        if (productos.some(p => p.id === producto.id)) {
            alert('ID ya existe');
            return;
        }
    }

    onAddProducto(producto);
    setFormData({ id: '', nombre: '', categoria: '', cantidad: '', precio: '' });
    alert('Producto agregado');
  };

  return (
    <>
      <h5>Agregar Producto</h5>
      <form onSubmit={handleSubmit}>
        <div className="row g-2 mb-3">
          <div className="col-12 col-md">
            <input
              name="id"
              id="addId"
              className="form-control"
              placeholder="ID"
              value={formData.id}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md">
            <input
              name="nombre"
              id="addName"
              className="form-control"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md">
            <input
              name="categoria"
              id="addCat"
              className="form-control"
              placeholder="Categoría"
              value={formData.categoria}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md">
            <input
              name="cantidad"
              id="addQty"
              type="number"
              className="form-control"
              placeholder="Cantidad"
              value={formData.cantidad}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md">
            <input
              name="precio"
              id="addPrice"
              type="number"
              className="form-control"
              placeholder="Precio"
              value={formData.precio}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md">
            <button type="submit" id="btnAddProd" className="btn btn-success w-100">Agregar</button>
          </div>
        </div>
      </form>
    </>
  );
};

export default AddTab;