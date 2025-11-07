import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UsuariosView = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Validación de rol administrador
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const esAdmin = usuarioActual?.role === 'administrador';

  useEffect(() => {
    if (!esAdmin) {
      navigate('/'); // redirige si no es admin
      return;
    }

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
  }, [esAdmin, navigate]);

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
    <div className="container-fluid mt-3 position-relative">
      {/* Botón fijo de cerrar sesión */}
      <div className="position-fixed top-0 end-0 m-3 z-3">
        <button className="btn btn-danger" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      <div className="px-3 pt-5">
        <h4 className="mb-3">Usuarios Registrados</h4>

        {/* Filtros */}
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre, apellido, correo o usuario"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-2">
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

        {/* Tarjetas responsivas para móviles */}
        <div className="row d-md-none">
          {usuariosFiltrados.map((u) => (
            <div key={u.id} className="col-12 mb-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{u.nombres} {u.apellidos}</h5>
                  <p className="card-text mb-1"><strong>Cédula:</strong> {u.cedula}</p>
                  <p className="card-text mb-1"><strong>Email:</strong> {u.email}</p>
                  <p className="card-text mb-1"><strong>Usuario:</strong> {u.username}</p>
                  <p className="card-text"><strong>Rol:</strong> {u.role}</p>
                </div>
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
    </div>
  );
};

export default UsuariosView;