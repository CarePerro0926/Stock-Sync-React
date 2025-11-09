import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ResponsiveTable from './ResponsiveTable';
import './ResponsiveTable.css';

const UsuariosView = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroTxt, setFiltroTxt] = useState('');
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const esAdmin = usuarioActual?.role === 'administrador';

  useEffect(() => {
    if (!esAdmin) {
      navigate('/');
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

  const listaRolesFiltro = useMemo(() => {
    const roles = usuarios
      .map(u => u.role)
      .filter(role => role && String(role).trim() !== '');
    const unicos = [...new Set(roles.map(role => String(role).trim()))];
    return ['todos', ...unicos];
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    let filtered = [...usuarios];

    if (filtroRol !== 'todos') {
      const filtroRolStr = String(filtroRol).trim();
      filtered = filtered.filter(u => {
        const role = u.role;
        return role && String(role).trim() === filtroRolStr;
      });
    }

    if (filtroTxt.trim()) {
      const term = filtroTxt.toLowerCase().trim();
      filtered = filtered.filter(u => {
        const nombresStr = String(u.nombres ?? '');
        const apellidosStr = String(u.apellidos ?? '');
        const emailStr = String(u.email ?? '');
        const usernameStr = String(u.username ?? '');
        return (
          nombresStr.toLowerCase().includes(term) ||
          apellidosStr.toLowerCase().includes(term) ||
          emailStr.toLowerCase().includes(term) ||
          usernameStr.toLowerCase().includes(term)
        );
      });
    }

    return filtered;
  }, [usuarios, filtroRol, filtroTxt]);

  const tableData = useMemo(() => {
    return usuariosFiltrados.map(u => ({
      id: u.id ?? '—',
      nombres: u.nombres ?? 'Sin nombre',
      apellidos: u.apellidos ?? 'Sin apellido',
      cedula: u.cedula ?? '—',
      email: u.email ?? '—',
      username: u.username ?? '—',
      role: u.role ?? 'Sin rol'
    }));
  }, [usuariosFiltrados]);

  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'cedula', label: 'Cédula' },
    { key: 'email', label: 'Email' },
    { key: 'username', label: 'Usuario' },
    { key: 'role', label: 'Rol' }
  ];

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
      <h5>Usuarios Registrados</h5>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6">
          <select
            className="form-select"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
          >
            {listaRolesFiltro.map((rol, index) => (
              <option key={`${rol}-${index}`} value={rol}>
                {rol.charAt(0).toUpperCase() + rol.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6">
          <input
            className="form-control"
            placeholder="Buscar por nombre, apellido, email o usuario..."
            value={filtroTxt}
            onChange={(e) => setFiltroTxt(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {usuariosFiltrados.length === 0 ? (
        <div className="text-center p-4">
          <p>No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="table-responsive mb-4">
          <ResponsiveTable headers={tableHeaders} data={tableData} />
        </div>
      )}

      <div className="mt-3 mb-2">
        <button
          className="btn w-100 text-white"
          style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default UsuariosView;