import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ResponsiveTable from './ResponsiveTable'; // Asegúrate de importar el componente ResponsiveTable
import './ResponsiveTable.css'; // Asegúrate de importar los estilos CSS si son compartidos

const UsuariosView = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroTxt, setFiltroTxt] = useState(''); // Renombrado de 'busqueda' para coincidir con InventoryTab
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
        // Corregido el espacio al final de la URL
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

  // useMemo para la lista de roles únicos para el filtro
  const listaRolesFiltro = useMemo(() => {
    const roles = usuarios
      .map(u => u.role)
      .filter(role => role && String(role).trim() !== '');
    const unicos = [...new Set(roles.map(role => String(role).trim()))];
    // CORREGIDO: Se usa 'unicos' aquí en lugar de 'unicas'
    return ['todos', ...unicos];
  }, [usuarios]);

  // useMemo para filtrar usuarios
  const usuariosFiltrados = useMemo(() => {
    let filtered = [...usuarios];

    // Filtrar por rol
    if (filtroRol !== 'todos') {
      const filtroRolStr = String(filtroRol).trim();
      filtered = filtered.filter(u => {
        const role = u.role;
        return role && String(role).trim() === filtroRolStr;
      });
    }

    // Filtrar por texto (nombre, apellido, email, username)
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

  // useMemo para preparar los datos para ResponsiveTable
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

  // Definir encabezados de la tabla
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
    <div className="card p-4 w-100"> {/* w-100 agregado, similar a InventoryTab */}
      <h5>Usuarios Registrados</h5> {/* Cambiado de h4 a h5 para coincidir con InventoryTab */}

      {/* Filtros: siempre visibles, similar a InventoryTab */}
      <div className="row g-2 mb-3">
        <div className="col">
          <select
            id="filtroRolAdmin" // ID único para el filtro de rol
            className="form-select"
            value={filtroRol}
            onChange={e => setFiltroRol(e.target.value)}
          >
            {listaRolesFiltro.map((rol, index) => (
              <option key={`${rol}-${index}`} value={rol}>
                {rol.charAt(0).toUpperCase() + rol.slice(1)} {/* Capitalizar primera letra */}
              </option>
            ))}
          </select>
        </div>
        <div className="col">
          <input
            id="filtroTxtAdmin" // ID único para el filtro de texto
            className="form-control"
            placeholder="Buscar por nombre, apellido, email o usuario..." // Placeholder actualizado
            value={filtroTxt}
            onChange={e => setFiltroTxt(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Contenedor con scroll VERTICAL solo para la tabla/tarjetas, similar a InventoryTab */}
      <div style={{ maxHeight: '250px', overflowY: 'auto' }}> {/* Ajusta la altura según necesites */}
        <div className="table-responsive">
          <ResponsiveTable
            headers={tableHeaders}
            data={tableData}
          />
        </div>
      </div>

      {/* Botón de cerrar sesión (fuera del contenedor scrollable principal, pero puedes dejarlo aquí si lo deseas) */}
      {/* Si decides dejarlo aquí, no será fijo */}
      <div className="mt-3">
        <button className="btn btn-danger" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default UsuariosView;