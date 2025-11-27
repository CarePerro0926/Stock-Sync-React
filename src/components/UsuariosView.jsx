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
  const [togglingIds, setTogglingIds] = useState(new Set());

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        // Asegúrate de que VITE_API_URL esté definida y apunte al backend correcto
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
    const texto = (busqueda || '').toLowerCase().trim();

    return usuarios.filter((u) => {
      const estaInhabilitado = !!(u.deleted_at || u.disabled || u.inactivo);

      // Si mostrarInactivos === true -> mostrar SOLO inactivos
      // Si mostrarInactivos === false -> mostrar SOLO activos
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
  }, [usuarios, busqueda, filtroRol, mostrarInactivos]);

  // Helper para hacer PATCH a las rutas enable/disable
  // AHORA INCLUYE EL HEADER DE AUTORIZACIÓN
  const doPatch = async (url, body) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // Obtener el token JWT del lugar donde lo guardes (por ejemplo, localStorage)
      // Ajusta la clave ('token', 'jwt', etc.) según como lo guardes tú
      const token = localStorage.getItem('token'); // o donde lo tengas almacenado
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('No se encontró token JWT para la solicitud PATCH.');
        // Opcional: Puedes decidir lanzar un error aquí si el token es obligatorio
        // throw new Error('No se encontró token de autenticación.');
      }

      const res = await fetch(url, {
        method: 'PATCH',
        headers: headers, // Usar los headers construidos arriba
        body: JSON.stringify(body)
      });
      const payload = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, payload };
    } catch (networkError) {
      return { ok: false, status: 0, payload: { error: networkError.message || String(networkError) } };
    }
  };

  // toggleUsuario ahora usa las rutas que tu backend expone: /api/usuarios/:id/(disable|enable)
  // y envía el token JWT en el header Authorization.
  const toggleUsuario = async (id, currentlyDisabled) => {
    const confirmMsg = currentlyDisabled ? '¿Reactivar este usuario?' : '¿Inhabilitar este usuario?';
    if (!window.confirm(confirmMsg)) return;

    setTogglingIds(prev => new Set(prev).add(id));

    const action = currentlyDisabled ? 'enable' : 'disable';
    // Asegúrate de que VITE_API_URL esté definida y apunte al backend correcto
    const url = `${import.meta.env.VITE_API_URL}/api/usuarios/${id}/${action}`;

    // El backend ignora el body, pero lo enviamos por si acaso
    const result = await doPatch(url, { reason: currentlyDisabled ? 'reactivado desde admin' : 'inhabilitado desde admin' });

    if (!result.ok) {
      if (result.status === 401) {
          // Manejar específicamente el error 401 (Unauthorized)
          console.error('No autorizado para inhabilitar/reactivar usuario:', result);
          alert('No autorizado. Asegúrate de iniciar sesión como administrador.');
      } else if (result.status === 404) {
        console.error('Ruta no encontrada al intentar PATCH usuario:', result);
        alert('Ruta no encontrada en la API al intentar cambiar el estado del usuario (404). Revisa la configuración del backend.');
      } else {
        const serverMsg = result.payload?.message || result.payload?.error || `HTTP ${result.status}`;
        console.error('Error al inhabilitar/reactivar usuario:', result);
        alert(`No se pudo cambiar el estado del usuario: ${serverMsg}`);
      }
      setTogglingIds(prev => {
        const copy = new Set(prev); copy.delete(id); return copy;
      });
      return;
    }

    // Éxito: actualizar estado localmente (marcamos deleted_at o lo limpiamos)
    setUsuarios(prev =>
      prev.map(u => {
        if (String(u.id) !== String(id)) return u;
        return {
          ...u,
          deleted_at: !currentlyDisabled ? new Date().toISOString() : null,
          disabled: !currentlyDisabled
        };
      })
    );

    setTogglingIds(prev => {
      const copy = new Set(prev); copy.delete(id); return copy;
    });

    // Opcional: forzar recarga para sincronizar con servidor
    setRecargar(prev => !prev);
  };

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

      <div className="usuarios-scroll-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {usuariosFiltrados.length === 0 ? (
          <div className="text-center p-4"><p>No se encontraron usuarios que coincidan con los filtros.</p></div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
            {usuariosFiltrados.map((user) => {
              const estaInhabilitado = !!(user.deleted_at || user.disabled || user.inactivo);
              const isToggling = togglingIds.has(user.id);
              return (
                <div className="col" key={user.id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title text-primary mb-3">{user.nombres ?? 'Sin Nombre'} {user.apellidos ?? 'Sin Apellido'}</h5>
                      <p className="card-text mb-1"><strong>Email:</strong> {user.email ?? '—'}</p>
                      <p className="card-text mb-1"><strong>Usuario:</strong> {user.username ?? '—'}</p>
                      <p className="card-text mb-1"><strong>Cédula:</strong> {user.cedula ?? '—'}</p>
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