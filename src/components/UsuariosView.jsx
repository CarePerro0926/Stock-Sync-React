import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// Ya no importamos ResponsiveTable, pero sí sus estilos
// si la nueva tabla los necesita.
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

  // tableData se mantiene igual, generando los datos
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

  // tableHeaders se mantiene igual
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
    <div className="container-fluid position-relative" style={{ minHeight: '100vh' }}>
      {/* Botón fijo fuera del scroll */}
      <div className="position-fixed top-0 end-0 m-3 z-3">
        <button className="btn btn-danger" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      <div className="card p-4 mt-5 w-100">
        <h5>Usuarios Registrados</h5>

        {/* Filtros: siempre visibles */}
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

        {/* Contenedor con scroll VERTICAL solo para la tabla (como en el ejemplo 1) */}
        {/* Usamos 45vh como en tu ejemplo para mantener consistencia */}
        <div style={{ maxHeight: '45vh', overflowY: 'auto', marginBottom: '1rem' }}>
          <div className="responsive-table-container">
            <table className="responsive-table w-100">
              <thead>
                <tr>
                  {tableHeaders.map(h => (
                    <th key={h.key} style={{ textAlign: h.align || 'left' }}>
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="text-center">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, i) => (
                    <tr key={i} className="table-row">
                      {tableHeaders.map(h => (
                        <td
                          key={h.key}
                          data-label={h.label} // Para el CSS responsive
                          className="table-cell" // Para el CSS responsive
                          style={{ textAlign: h.align || 'left', verticalAlign: 'middle' }}
                        >
                          {row[h.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Aquí podrías poner botones o un footer si fuera necesario,
            quedarían fuera del scroll, igual que los filtros. */}

      </div>
    </div>
  );
};

export default UsuariosView;