// src/components/RegisterView.jsx
import React, { useState } from 'react';

const RegisterView = ({ onShowLogin }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    fecha: '',
    email: '',
    user: '',
    pass: '',
    role: 'cliente'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { role, email, user, pass, fecha, ...rest } = formData;

    // Validación de correo para admin
    if (role === 'admin' && !email.toLowerCase().endsWith('@stocksync.com')) {
      alert('Los administradores deben registrarse con un correo @stocksync.com');
      return;
    }

    // Validar campos obligatorios
    if (Object.values(rest).some(v => !v) || !user || !pass || !email || !fecha) {
      alert('Completa todos los campos');
      return;
    }

    // Validar formato de fecha
    const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha);
    if (!fechaValida) {
      alert('Formato de fecha inválido. Usa el selector de fecha.');
      return;
    }

    // Validar que la fecha no sea futura
    const hoy = new Date().toISOString().split('T')[0];
    if (fecha > hoy) {
      alert('La fecha de nacimiento no puede ser futura.');
      return;
    }

    try {
      const response = await fetch('https://stock-sync-api.onrender.com/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Error: ${result.message}`);
        return;
      }

      alert(result.message);
      onShowLogin();
    } catch (error) {
      console.error('Error inesperado:', error);
      alert('Error inesperado. Revisa la consola.');
    }
  };

  return (
    <div className="card mx-auto p-4" style={{ maxWidth: '400px' }}>
      <h4 className="mb-3">Registro de Usuario</h4>
      <form onSubmit={handleSubmit}>
        <input name="nombres" className="form-control mb-2" placeholder="Nombres" value={formData.nombres} onChange={handleChange} />
        <input name="apellidos" className="form-control mb-2" placeholder="Apellidos" value={formData.apellidos} onChange={handleChange} />
        <input name="cedula" className="form-control mb-2" placeholder="Cédula" value={formData.cedula} onChange={handleChange} />
        <label className="form-label">Fecha de Nacimiento</label>
        <input name="fecha" type="date" className="form-control mb-2" value={formData.fecha} onChange={handleChange} />
        <input name="email" type="email" className="form-control mb-2" placeholder="Correo Electrónico" value={formData.email} onChange={handleChange} />
        <input name="user" className="form-control mb-2" placeholder="Nombre de Usuario" value={formData.user} onChange={handleChange} />
        <input name="pass" type="password" className="form-control mb-2" placeholder="Contraseña" value={formData.pass} onChange={handleChange} />
        <select name="role" className="form-select mb-3" value={formData.role} onChange={handleChange}>
          <option value="cliente">Cliente</option>
          <option value="admin">Administrador</option>
        </select>
        <div className="d-flex justify-content-between">
          <button type="submit" className="btn btn-success">Registrar</button>
          <button type="button" onClick={onShowLogin} className="btn btn-outline-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterView;