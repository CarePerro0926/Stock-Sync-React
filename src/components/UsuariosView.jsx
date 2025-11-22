// src/components/UsuariosView.jsx
import React, { useEffect, useState, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './ResponsiveTable.css';
import RegisterView from './RegisterView';

const UsuariosView = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [recargar, setRecargar] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`);
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || 'Error al obtener usuarios');
        setUsuarios(Array.isArray(data) ? data : []);
        setError(null);
      } catch (fetchError) {
        console.error('Error fetching usuarios:', fetchError);
        setError(fetchError.message || 'Error al obtener usuarios');
      }
    };

    fetchUsuarios();
  }, [recargar]);

  const listaRolesFiltro = useMemo(() => {
    const roles = usuarios
      .map(u => u.role)
      .filter(role => role && String(role).trim() !== '');
    const unicos = [...new Set(roles.map(role => String(role).trim()))];
    return ['todos', ...unicos];
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const estaInhabilitado = !!(u.deleted_at || u.disabled || u.inactivo);

      if (!mostrarInactivos && estaInhabilitado) return false;

      const texto = (busqueda || '').toLowerCase().trim();
      const coincideBusqueda =
        (u.nombres?.toLowerCase().includes(texto)) ||
        (u.apellidos?.toLowerCase().includes(texto)) ||
        (u.email?.toLowerCase().includes(texto)) ||
        (u.username?.toLowerCase().includes(texto)) ||
        String(u.cedula ?? '').toLowerCase().includes(texto);

      const coincideRol =
        filtroRol === 'todos' || (u.role?.toLowerCase() === filtroRol);

      return coincideBusqueda && coincideRol;
    });
  }, [usuarios, busqueda, filtroRol, mostrarInactivos]);

  /**
   * toggleUsuario: intenta varios endpoints/fallbacks para inhabilitar/reactivar usuarios.
   * - Primero intenta PATCH /api/usuarios/:id/disable o /enable (según acción).
   * - Si falla, intenta PATCH /api/usuarios/:id con { disabled: true/false }.
   * - Si sigue fallando, intenta PATCH /api/usuarios/:id con { deleted_at: timestamp/null }.
   * - Actualiza el estado local (usuarios) al finalizar con éxito para evitar recarga inmediata.
   */
  const toggleUsuario = async (id, currentlyDisabled) => {
    const confirmMsg = currentlyDisabled ? '¿Reactivar este usuario?' : '¿Inhabilitar este usuario?';
    if (!window.confirm(confirmMsg)) return;

    const base = `${import.meta.env.VITE_API_URL}/api/usuarios/${id}`;

    const tryPatch = async (url, body) => {
      try {
        const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        let parsed = null;
        try { parsed = await res.json(); } catch { /* no json */ }
        if (res.ok) return { ok: true, status: res.status, body: parsed };
        const msg = parsed?.message || parsed?.error || `HTTP ${res.status}`;
        return { ok: false, status: res.status, errorMessage: msg, body: parsed };
      } catch (networkError) {
        return { ok: false, status: 0, errorMessage: networkError.message || String(networkError) };
      }
    };

    const attempts = [
      { url: `${base}/${currentlyDisabled ? 'enable' : 'disable'}`, body: { reason: currentlyDisabled ? 'reactivado desde admin' : 'inhabilitado desde admin' } },
      { url: base, body: { disabled: !currentlyDisabled } },
      { url: base, body: { deleted_at: !currentlyDisabled ? new Date().toISOString() : null } }
    ];

    let success = false;
    let lastError = null;

    for (const attempt of attempts) {
      const result = await tryPatch(attempt.url, attempt.body);
      if (result.ok) {
        success = true;
        break;
      } else {
        lastError = result;
      }
    }

    if (!success) {
      console.error('Error al intentar toggle (todos los intentos):', lastError);
      alert('Ocurrió un error al cambiar el estado del usuario. Revisa la consola para más detalles.');
      return;
    }

    // Actualizamos el estado localmente para reflejar el cambio
    setUsuarios(prev =>
      prev.map(u => {
        if (String(u.id) !== String(id)) return u;
        const newDeletedAt = !currentlyDisabled ? new Date().toISOString() : null;
        const newDisabled = !currentlyDisabled;
        return {
          ...u,
          deleted_at: newDeletedAt,
          disabled: newDisabled
        };
      })
    );

    // Forzar recarga si quieres datos frescos del servidor
    setRecargar(prev => !prev);
  };

  return (
    <div className="w-100">
      <h5>Usuarios Registrados</h5>

      <div className="d-flex justify-content-between mb-3">
        <div>
          <button
            className="btn btn-primary"
            onClick={() => setMostrarModal(true)}
          >
            Agregar Usuario
          </button>
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
          <select
            className="form-select"
            value={filtroRol}
            onChange={(evt) => setFiltroRol(evt.target.value)}
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

      <div className="usuarios-scroll-container">
        {usuariosFiltrados.length === 0 ? (
          <div className="text-center p-4">
            <p>No se encontraron usuarios que coincidan con los filtros.</p>
          </div>
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
                      </h5>
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

                      <div className="d-flex gap-2 mt-3">
                        <button
                          className={`btn btn-sm ${estaInhabilitado ? 'btn-success' : 'btn-warning'}`}
                          onClick={() => toggleUsuario(user.id, estaInhabilitado)}
                        >
                          {estaInhabilitado ? 'Reactivar' : 'Inhabilitar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de registro */}
      {mostrarModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar Usuario</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <div className="modal-body">
                <RegisterView onShowLogin={() => {
                  setMostrarModal(false);
                  setRecargar(prev => !prev);
                }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosView;