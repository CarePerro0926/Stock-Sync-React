// src/components/UsuariosView.jsx

import React, { useEffect, useState } from 'react';

const UsuariosView = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('https://stock-sync-api.onrender.com/api/usuarios');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al obtener usuarios');
        }

        setUsuarios(data);
      } catch (err) {
        console.error('Error:', err.message);
        setError(err.message);
      }
    };

    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      u.nombres?.toLowerCase().includes(texto) ||
      u.apellidos?.toLowerCase().includes(texto) ||
      u.email?.toLowerCase().includes(texto) ||
      u.username?.toLowerCase().includes(texto);

    const coincideRol =
      filtroRol === 'todos' || u.role?.toLowerCase() === filtroRol;

    return coincideBusqueda && coincideRol;
  });

  return (
    <div className="mt-4">
      <h4>Usuarios Registrados</h4>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, apellido, correo o usuario"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
          >
            <option value="todos">Todos los roles</option>
            <option value="cliente">Solo clientes</option>
            <option value="administrador">Solo administradores</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Vista tipo tarjeta para móviles */}
      <div className="d-md-none">
        {usuariosFiltrados.map((u) => (
          <div key={u.id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">{u.nombres} {u.apellidos}</h5>
              <p className="card-text mb-1"><strong>Cédula:</strong> {u.cedula}</p>
              <p className="card-text mb-1"><strong>Email:</strong> {u.email}</p>
              <p className="card-text mb-1"><strong>Usuario:</strong> {u.username}</p>
              <p className="card-text"><strong>Rol:</strong> {u.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla para pantallas medianas y grandes */}
      <div className="d-none d-md-block">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Cédula</th>
              <th>Email</th>
              <th>Usuario</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id}>
                <td>{u.nombres}</td>
                <td>{u.apellidos}</td>
                <td>{u.cedula}</td>
                <td>{u.email}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosView;