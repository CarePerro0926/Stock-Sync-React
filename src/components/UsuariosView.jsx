// src/components/UsuariosView.jsx
import React, { useEffect, useState, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './ResponsiveTable.css';
import RegisterView from './RegisterView';

const UsuariosView = ({
  usuarios: usuariosProp = null, // ✅ Recibido como prop desde AdminView (opcional)
  onToggleUsuario = null, // ✅ Opcional: función para inhabilitar/reactivar
  onReloadUsuarios = null // ✅ Opcional: para recargar lista global en AdminView
}) => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [recargar, setRecargar] = useState(false); // ✅ Estado local para recargar
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  // ✅ Elegir fuente de usuarios: prop o estado local
  const usuariosFuente = usuariosProp || usuarios;

  // ✅ Cargar usuarios si no vienen por props
  useEffect(() => {
    if (usuariosProp && Array.isArray(usuariosProp)) {
      // Si viene por props, no hacemos fetch
      return;
    }

    const fetchUsuarios = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`);
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = data?.message || data?.error || `HTTP ${res.status}`;
          throw new Error(msg);
        }
        setUsuarios(Array.isArray(data) ? data : []);
        setError(null);
      } catch (fetchError) {
        console.error('Error fetching usuarios:', fetchError);
        setError(fetchError.message || 'Error al obtener usuarios');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [usuariosProp, recargar]);

  // ✅ Refrescar lista global si se cambia desde aquí (opcional)
  const handleToggleUsuarioLocal = async (userId) => {
    if (!onToggleUsuario) {
      console.warn('onToggleUsuario no está definido');
      return;
    }
    const user = usuariosFuente.find(u => u.id === userId);
    if (!user) return;

    const estaInhabilitado = !!(user.deleted_at || user.disabled || user.inactivo);
    const confirmText = estaInhabilitado ? '¿Reactivar este usuario?' : '¿Inhabilitar este usuario?';
    if (!window.confirm(confirmText)) return;

    const success = await onToggleUsuario(userId, estaInhabilitado);
    if (success && onReloadUsuarios) {
      await onReloadUsuarios(); // Actualizar lista global
    }
  };

  const listaRolesFiltro = useMemo(() => {
    const roles = usuariosFuente
      .map(u => u.role)
      .filter(role => role && String(role).trim() !== '');
    const unicos = [...new Set(roles.map(role => String(role).trim()))];
    return ['todos', ...unicos];
  }, [usuariosFuente]);

  const usuariosFiltrados = useMemo(() => {
    const texto = (busqueda || '').toLowerCase().trim();
    return usuariosFuente.filter((u) => {
      const estaInhabilitado = !!(u.deleted_at || u.disabled || u.inactivo);

      // Aplicar filtro de "Mostrar inactivos" solo en esta pestaña
      if (mostrarInactivos) {
        if (!estaInhabilitado) return false;
      } else {
        if (estaInhabilitado) return false;
      }

      const coincideBusqueda =
        (u.nombres?.toLowerCase().includes(texto)) ||
        (u.apellidos?.toLowerCase().includes(texto)) ||
        (u.email?.toLowerCase().includes(texto)) ||
        (u.username?.toLowerCase().includes(texto)) ||
        String(u.cedula ?? '').toLowerCase().includes(texto);

      const coincideRol = filtroRol === 'todos' || (u.role?.toLowerCase() === filtroRol);

      return coincideBusqueda && coincideRol;
    });
  }, [usuariosFuente, busqueda, filtroRol, mostrarInactivos]);

  return (
    <div className="w-100">
      <h5>Usuarios Registrados</h5>
      <div className="d-flex justify-content-between mb-3">
        <div>
          <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>Agregar Usuario</button>
        </div>
        <div className="d-flex align-items-center">
          <div className="form-check me-3">
            <input
              id="chkMostrarInactivosUsers"
              className="form-check-input"
              type="checkbox"
              checked={mostrarInactivos}
              onChange={(evt) => setMostrarInactivos(evt.target.checked)}
            />
            <label className="form-check-label" htmlFor="chkMostrarInactivosUsers">Mostrar inactivos</label>
          </div>
        </div>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6">
          <input
            className="form-control"
            placeholder="Buscar por nombre, apellido, correo, usuario o cédula..."
            value={busqueda}
            onChange={(evt) => setBusqueda(evt.target.value)}
          />
        </div>
        <div className="col-12 col-md-6">
          <select className="form-select" value={filtroRol} onChange={(evt) => setFiltroRol(evt.target.value)}>
            <option value="todos">Todos los roles</option>
            {listaRolesFiltro.filter(rol => rol !== 'todos').map((rol, index) => (
              <option key={`${rol}-${index}`} value={rol}>{rol.charAt(0).toUpperCase() + rol.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && !usuariosProp && <div className="text-center p-4">Cargando usuarios...</div>}
      <div className="usuarios-scroll-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {usuariosFiltrados.length === 0 ? (
          <div className="text-center p-4"><p>No se encontraron usuarios que coincidan con los filtros.</p></div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
            {usuariosFiltrados.map((user) => {
              const estaInhabilitado = !!(user.deleted_at || user.disabled || user.inactivo);
              return (
                <div className="col" key={user.id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title text-primary mb-3">
                        {user.nombres ?? 'Sin Nombre'} {user.apellidos ?? 'Sin Apellido'}
                        {estaInhabilitado && <span className="badge bg-warning ms-2">Inactivo</span>}
                      </h5>
                      <p className="card-text mb-1"><strong>Email:</strong> {user.email ?? '—'}</p>
                      <p className="card-text mb-1"><strong>Usuario:</strong> {user.username ?? '—'}</p>
                      <p className="card-text mb-1"><strong>Cédula:</strong> {user.cedula ?? '—'}</p>
                      <p className="card-text">
                        <strong>Rol:</strong>
                        <span className={`badge ${user.role === 'administrador' ? 'bg-danger' : 'bg-success'} ms-2`}>
                          {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : '—'}
                        </span>
                      </p>
                      {/* ✅ Botón para inhabilitar/reactivar, si se desea */}
                      {onToggleUsuario && (
                        <button
                          className={`btn btn-sm ${estaInhabilitado ? 'btn-success' : 'btn-warning'}`}
                          onClick={() => handleToggleUsuarioLocal(user.id)}
                        >
                          {estaInhabilitado ? 'Reactivar' : 'Inhabilitar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {mostrarModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar Usuario</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <div className="modal-body">
                <RegisterView onShowLogin={() => { setMostrarModal(false); setRecargar(prev => !prev); }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosView;