// src/components/UsuariosView.jsx

import React, { useEffect, useState, useMemo } from 'react';
import './ResponsiveTable.css';


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

  // Lista de roles únicos para el filtro (similar a listaCategoriasFiltro en InventoryTab)
  const listaRolesFiltro = useMemo(() => {
    const roles = usuarios
      .map(u => u.role)
      .filter(role => role && String(role).trim() !== '');
    const unicos = [...new Set(roles.map(role => String(role).trim()))];
    return ['todos', ...unicos];
  }, [usuarios]);


  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const texto = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        u.nombres?.toLowerCase().includes(texto) ||
        u.apellidos?.toLowerCase().includes(texto) ||
        u.email?.toLowerCase().includes(texto) ||
        u.username?.toLowerCase().includes(texto) ||
        String(u.cedula ?? '').toLowerCase().includes(texto); // Incluimos cédula en la búsqueda

      const coincideRol =
        filtroRol === 'todos' || u.role?.toLowerCase() === filtroRol;

      return coincideBusqueda && coincideRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  // Ya no necesitamos tableHeaders ni tableData

  return (
    <div className="w-100">
      <h5>Usuarios Registrados</h5>

      {/* Filtros: Visibles siempre en la parte superior */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6">
          <input
            className="form-control"
            placeholder="Buscar por nombre, apellido, correo, usuario o cédula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-6">
          <select
            className="form-select"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
          >
            <option value="todos">Todos los roles</option>
            {listaRolesFiltro
              .filter(rol => rol !== 'todos')
              .map((rol, index) => (
                <option key={`${rol}-${index}`} value={rol}>
                  {rol.charAt(0).toUpperCase() + rol.slice(1)}
                </option>
              ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Contenedor con scroll VERTICAL para las tarjetas */}
      {/* Usamos un max-height y overflow-y: auto, similar a tu ejemplo de Inventario */}
      <div className="usuarios-scroll-container">
        {usuariosFiltrados.length === 0 ? (
          <div className="text-center p-4">
            <p>No se encontraron usuarios que coincidan con los filtros.</p>
          </div>
        ) : (
          /* Estructura de grid responsivo para las tarjetas (similar a InventoryTab) */
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
            {usuariosFiltrados.map((user) => (
              <div className="col" key={user.id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title text-primary mb-3">
                      {user.nombres ?? 'Sin Nombre'} {user.apellidos ?? 'Sin Apellido'}
                    </h5>
                    
                    {/* Detalles del usuario en la tarjeta */}
                    <p className="card-text mb-1">
                      <strong>Email:</strong> {user.email ?? '—'}
                    </p>
                    <p className="card-text mb-1">
                      <strong>Usuario:</strong> {user.username ?? '—'}
                    </p>
                    <p className="card-text mb-1">
                      <strong>Cédula:</strong> {user.cedula ?? '—'}
                    </p>
                    <p className="card-text">
                      <strong>Rol:</strong> 
                      <span className={`badge ${user.role === 'administrador' ? 'bg-danger' : 'bg-success'} ms-2`}>
                        {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : '—'}
                      </span>
                    </p>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsuariosView;