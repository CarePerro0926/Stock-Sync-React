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
    <div className="w-100">
      <h5>Usuarios Registrados</h5>

      <div className="row g-2 mb-3">
        <div className="col">
          <input
            className="form-control"
            placeholder="Buscar por nombre, apellido, correo o usuario"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col">
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

      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        <div className="table-responsive">
          <div className="row g-2">
            {usuariosFiltrados.map((u) => (
              <div key={u.id} className="col-md-4">
                <div className="card border shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title mb-1">{u.nombres} {u.apellidos}</h6>
                    <p className="mb-1"><strong>Cédula:</strong> {u.cedula}</p>
                    <p className="mb-1"><strong>Email:</strong> {u.email}</p>
                    <p className="mb-1"><strong>Usuario:</strong> {u.username}</p>
                    <p className="mb-0"><strong>Rol:</strong> {u.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuariosView;