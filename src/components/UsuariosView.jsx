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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Encabezado y filtros fijos */}
      <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ccc' }}>
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
      </div>

      {/* Tarjetas con scroll vertical */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem',
        backgroundColor: '#fff'
      }}>
        {usuariosFiltrados.map((u) => (
          <div key={u.id} style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h5>{u.nombres} {u.apellidos}</h5>
            <p><strong>Cédula:</strong> {u.cedula}</p>
            <p><strong>Email:</strong> {u.email}</p>
            <p><strong>Usuario:</strong> {u.username}</p>
            <p><strong>Rol:</strong> {u.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsuariosView;