// src/components/Admin/ProvidersTab.js
import React, { useState } from 'react';

const ProvidersTab = ({ proveedores, onAddProveedor }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.email.trim()) {
      alert('Completa nombre y email del proveedor.');
      return;
    }
    onAddProveedor(formData);
    setFormData({ nombre: '', email: '' });
    alert('Proveedor agregado');
  };

  return (
    <>
      <h5>Proveedores</h5>
      <form onSubmit={handleSubmit}>
        <div className="row g-2 mb-3">
          <div className="col-12 col-md">
            <input
              name="nombre"
              id="provName"
              className="form-control"
              placeholder="Nombre Proveedor"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md">
            <input
              name="email"
              id="provEmail"
              className="form-control"
              placeholder="Email Proveedor"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md">
            <button type="submit" id="btnAddProv" className="btn btn-success w-100">Agregar</button>
          </div>
        </div>
      </form>
      <ul id="lstProv" className="list-group">
        {proveedores.map((pr, index) => (
          <li key={index} className="list-group-item">{pr.nombre} – {pr.email}</li>
        ))}
      </ul>
    </>
  );
};

export default ProvidersTab;