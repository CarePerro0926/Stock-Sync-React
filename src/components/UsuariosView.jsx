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
  const [togglingIds, setTogglingIds] = useState(new Set()); // ids en proceso

  useEffect(() => {
    const fetchUsuarios = async () => {
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
   * toggleUsuario:
   * - Hace un único PATCH al recurso principal: /api/usuarios/:id con { disabled: true/false }.
   * - Si la API responde 404, muestra mensaje claro y registra la respuesta en consola.
   * - Deshabilita el botón mientras la petición está en curso.
   */
  const toggleUsuario = async (id, currentlyDisabled) => {
    const confirmMsg = currentlyDisabled ? '¿Reactivar este usuario?' : '¿Inhabilitar este usuario?';
    if (!window.confirm(confirmMsg)) return;

    // Marcar id como en proceso
    setTogglingIds(prev => new Set(prev).add(id));

    const url = `${import.meta.env.VITE_API_URL}/api/usuarios/${id}`;
    const body = { disabled: !currentlyDisabled };

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        // Manejo específico para 404 (ruta no encontrada)
        if (res.status === 404) {
          console.error('Ruta no encontrada al intentar PATCH usuario:', { status: res.status, payload });
          alert('Ruta no encontrada en la API al intentar cambiar el estado del usuario (404). Revisa la configuración del backend.');
        } else {
          const serverMsg = payload?.message || payload?.error || `HTTP ${res.status}`;
          console.error('Error al inhabilitar/reactivar usuario:', { status: res.status, payload });
          alert(`No se pudo cambiar el estado del usuario: ${serverMsg}`);
        }
        return;
      }

      // Éxito: actualizar estado localmente
      setUsuarios(prev =>
        prev.map(u => {
          if (String(u.id) !== String(id)) return u;
          return {
            ...u,
            disabled: !currentlyDisabled,
            deleted_at: !currentlyDisabled ? new Date().toISOString() : null
          };
        })
      );

      // Opcional: forzar recarga para sincronizar con servidor
      setRecargar(prev => !prev);
    } catch (networkError) {
      console.error('Error de red al cambiar estado del usuario:', networkError);
      alert('Error de red al cambiar el estado del usuario. Revisa la consola para más detalles.');
    } finally {
      // Quitar id del set de procesos
      setTogglingIds(prev => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    }
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

      <div className="usuarios-scroll-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {usuariosFiltrados.length === 0 ? (
          <div className="text-center p-4">
            <p>No se encontraron usuarios que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
            {usuariosFiltrados.map((user) => {
              const estaInhabilitado = !!(user.deleted_at || user.disabled || user.inactivo);
              const isToggling = togglingIds.has(user.id);
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
                          disabled={isToggling}
                        >
                          {isToggling ? 'Procesando...' : (estaInhabilitado ? 'Reactivar' : 'Inhabilitar')}
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