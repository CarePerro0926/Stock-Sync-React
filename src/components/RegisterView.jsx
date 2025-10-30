// src/components/RegisterView.jsx
import React, { useState } from 'react';
import { supabase } from '@/services/supabaseClient';

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
      // Validar que el username no esté repetido
      const { data: existingUser, error: lookupError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('username', user)
        .single();

      if (existingUser) {
        alert('Ese nombre de usuario ya está en uso. Elige otro.');
        return;
      }

      // 1. Registrar en Supabase Auth con nickname y role
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: pass.trim(),
        options: {
          data: {
            nickname: user,
            role: role === 'admin' ? 'administrador' : 'cliente'
          }
        }
      });

      if (authError) {
        console.error('Error Auth:', authError.message);
        alert(`Error al registrar: ${authError.message}`);
        return;
      }

      const userId = authData?.user?.id;
      if (!userId) {
        alert('No se pudo obtener el ID del usuario registrado.');
        return;
      }

      // 2. Insertar perfil en tabla usuarios
      const { error: insertError } = await supabase.from('usuarios').insert({
        id: userId,
        email: email,
        username: user,
        pass: pass,
        role: role === 'admin' ? 'administrador' : 'cliente',
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        cedula: formData.cedula,
        fecha_nacimiento: formData.fecha,
        telefono: null
      });

      if (insertError) {
        console.error('Error al insertar perfil:', insertError.message);
        alert(`Error al guardar perfil: ${insertError.message}`);
        return;
      }

      alert('Usuario registrado con éxito');
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