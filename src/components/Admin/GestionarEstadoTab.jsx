// src/components/Admin/GestionarEstadoTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';

const GestionarEstadoTab = ({
  onToggleProducto,
  onToggleProveedor,
  onToggleCategoria,
  onToggleUsuario,
  productos = [],
  proveedores: proveedoresProp = [],
  categorias: categoriasProp = [],
  usuarios: usuariosProp = [] // opcional: pasar desde AdminView
}) => {
  // Producto
  const [inputProducto, setInputProducto] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [sugerenciasProducto, setSugerenciasProducto] = useState([]);

  // Proveedor
  const [inputProveedor, setInputProveedor] = useState('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [sugerenciasProveedor, setSugerenciasProveedor] = useState([]);
  const [proveedores, setProveedores] = useState(proveedoresProp);

  // Categoría
  const [inputCategoria, setInputCategoria] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [sugerenciasCategoria, setSugerenciasCategoria] = useState([]);
  const [categorias, setCategorias] = useState(categoriasProp);

  // Usuario
  const [inputUsuario, setInputUsuario] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [sugerenciasUsuario, setSugerenciasUsuario] = useState([]);
  const [usuarios, setUsuarios] = useState(usuariosProp || []);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuariosError, setUsuariosError] = useState('');

  // -------------------- Cargas iniciales (proveedores, categorías) --------------------
  useEffect(() => {
    let mounted = true;
    if (!proveedoresProp || proveedoresProp.length === 0) {
      supabase
        .from('proveedores')
        .select('*')
        .order('nombre', { ascending: true })
        .then(({ data, error }) => {
          if (error) console.error('Error al cargar proveedores:', error);
          else if (mounted) setProveedores(data || []);
        });
    } else {
      setProveedores(proveedoresProp);
    }
    return () => { mounted = false; };
  }, [proveedoresProp]);

  useEffect(() => {
    let mounted = true;
    if (!categoriasProp || categoriasProp.length === 0) {
      supabase
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true })
        .then(({ data, error }) => {
          if (error) console.error('Error al cargar categorías:', error);
          else if (mounted) setCategorias(data || []);
        });
    } else {
      setCategorias(categoriasProp);
    }
    return () => { mounted = false; };
  }, [categoriasProp]);

  // -------------------- Cargar usuarios (normalizar display_name / user_id) --------------------
  useEffect(() => {
    let mounted = true;
    const needFetch = !usuariosProp || usuariosProp.length === 0;

    if (!needFetch) {
      // Normalizar la prop si viene desde AdminView (puede tener user_id/display_name o id/nombres)
      const normalizedFromProp = usuariosProp.map(u => ({
        id: String(u.user_id ?? u.id ?? ''),
        display_name: u.display_name ?? u.displayName ?? u.nombres ?? `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim(),
        deleted_at: u.deleted_at ?? null
      }));
      setUsuarios(normalizedFromProp);
      return () => { mounted = false; };
    }

    setUsuariosLoading(true);
    setUsuariosError('');
    supabase
      .from('user_profiles')
      .select('user_id, display_name, deleted_at')
      .order('display_name', { ascending: true })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error('Error al cargar usuarios:', error);
          setUsuariosError('No fue posible cargar usuarios. Revisa keys, CORS o la tabla user_profiles.');
          setUsuariosLoading(false);
          return;
        }
        const normalized = (data || []).map(u => ({
          id: String(u.user_id),
          display_name: u.display_name || String(u.user_id),
          deleted_at: u.deleted_at || null
        }));
        setUsuarios(normalized);
        setUsuariosLoading(false);
      });

    return () => { mounted = false; };
  }, [usuariosProp]);

  // -------------------- Utilidades --------------------
  const filtrarSugerencias = (texto, lista, campo) => {
    const q = String(texto || '').trim().toLowerCase();
    if (!q) return [];
    return lista
      .filter(item =>
        String(item.id).toLowerCase().includes(q) ||
        String(item[campo] ?? '').toLowerCase().includes(q)
      )
      .slice(0, 8);
  };

  const parseIdFromInput = (entrada) => {
    const trimmed = String(entrada || '').trim();
    if (!trimmed) return '';
    if (trimmed.includes(' - ')) return trimmed.split(' - ')[0].trim();
    return trimmed;
  };

  const applyToggleFallback = async ({ table, id, currentlyDisabled, idColumn = 'id' }) => {
    try {
      const newDeletedAt = currentlyDisabled ? null : new Date().toISOString();
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: newDeletedAt })
        .eq(idColumn, id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Fallback toggle error:', err);
      alert('Ocurrió un error al cambiar el estado. Intenta de nuevo.');
      return false;
    }
  };

  // -------------------- Handlers --------------------
  const handleToggleProducto = async (e) => {
    e.preventDefault();
    const entrada = parseIdFromInput(inputProducto);
    let idFinal = entrada || productoSeleccionado;
    if (!idFinal && inputProducto) {
      const matchByName = productos.find(p => String(p.nombre).toLowerCase() === String(inputProducto).trim().toLowerCase());
      if (matchByName) idFinal = matchByName.id;
    }
    const prod = productos.find(p => String(p.id) === String(idFinal));
    if (!prod) return alert('No se encontró ningún producto con ese ID o nombre.');
    const currentlyDisabled = !!prod.deleted_at;
    if (!window.confirm(currentlyDisabled ? '¿Reactivar este producto?' : '¿Inhabilitar este producto?')) return;

    if (typeof onToggleProducto === 'function') {
      await onToggleProducto(idFinal, currentlyDisabled);
    } else {
      const ok = await applyToggleFallback({ table: 'productos', id: idFinal, currentlyDisabled });
      if (!ok) return;
    }
    setInputProducto(''); setProductoSeleccionado(''); setSugerenciasProducto([]);
  };

  const handleToggleProveedor = async (e) => {
    e.preventDefault();
    const entrada = parseIdFromInput(inputProveedor);
    let idFinal = entrada || proveedorSeleccionado;
    if (!idFinal && inputProveedor) {
      const matchByName = proveedores.find(p => String(p.nombre).toLowerCase() === String(inputProveedor).trim().toLowerCase());
      if (matchByName) idFinal = matchByName.id;
    }
    const prov = proveedores.find(p => String(p.id) === String(idFinal));
    if (!prov) return alert('No se encontró ningún proveedor con ese ID o nombre.');
    const currentlyDisabled = !!prov.deleted_at;
    if (!window.confirm(currentlyDisabled ? '¿Reactivar este proveedor?' : '¿Inhabilitar este proveedor?')) return;

    if (typeof onToggleProveedor === 'function') {
      await onToggleProveedor(idFinal, currentlyDisabled);
    } else {
      const ok = await applyToggleFallback({ table: 'proveedores', id: idFinal, currentlyDisabled });
      if (!ok) return;
    }
    setInputProveedor(''); setProveedorSeleccionado(''); setSugerenciasProveedor([]);
  };

  const handleToggleCategoria = async (e) => {
    e.preventDefault();
    const entrada = parseIdFromInput(inputCategoria);
    let idFinal = entrada || categoriaSeleccionada;

    let cat = categorias.find(c => String(c.id) === String(idFinal));
    if (!cat && inputCategoria) {
      cat = categorias.find(c => String(c.nombre).toLowerCase() === String(inputCategoria).trim().toLowerCase());
      if (cat) idFinal = cat.id;
    }
    if (!cat) return alert('No se encontró ninguna categoría con ese ID o nombre.');

    const currentlyDisabled = !!cat.deleted_at;
    if (!window.confirm(currentlyDisabled ? '¿Reactivar esta categoría?' : '¿Inhabilitar esta categoría?')) return;

    if (typeof onToggleCategoria === 'function') {
      await onToggleCategoria(cat.id, currentlyDisabled);
    } else {
      const ok = await applyToggleFallback({ table: 'categorias', id: cat.id, currentlyDisabled });
      if (!ok) return;
    }
    setInputCategoria(''); setCategoriaSeleccionada(''); setSugerenciasCategoria([]);
  };

  const handleToggleUsuario = async (e) => {
    e.preventDefault();
    const entrada = parseIdFromInput(inputUsuario);
    let idFinal = entrada || usuarioSeleccionado;

    let user = usuarios.find(u => String(u.id) === String(idFinal));
    if (!user && inputUsuario) {
      user = usuarios.find(u => String(u.display_name).toLowerCase() === String(inputUsuario).trim().toLowerCase());
      if (user) idFinal = user.id;
    }
    if (!user) return alert('No se encontró ningún usuario con ese ID o nombre.');

    const currentlyDisabled = !!user.deleted_at;
    if (!window.confirm(currentlyDisabled ? '¿Reactivar este usuario?' : '¿Inhabilitar este usuario?')) return;

    if (typeof onToggleUsuario === 'function') {
      await onToggleUsuario(idFinal, currentlyDisabled);
    } else {
      const ok = await applyToggleFallback({
        table: 'user_profiles',
        id: idFinal,
        currentlyDisabled,
        idColumn: 'user_id'
      });
      if (!ok) return;
    }

    // actualizar estado local para reflejar cambio inmediato
    setUsuarios(prev => prev.map(u => (String(u.id) === String(idFinal) ? { ...u, deleted_at: currentlyDisabled ? null : new Date().toISOString() } : u)));
    setInputUsuario(''); setUsuarioSeleccionado(''); setSugerenciasUsuario([]);
  };

  // -------------------- Render --------------------
  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
      <h5>Gestionar estado (Inhabilitar / Reactivar)</h5>

      {/* Producto */}
      <section className="mt-3">
        <h6>Producto</h6>
        <form onSubmit={handleToggleProducto}>
          <div className="mb-2">
            <label className="form-label">Selecciona un producto</label>
            <select
              className="form-select"
              value={productoSeleccionado}
              onChange={(e) => {
                const id = e.target.value;
                setProductoSeleccionado(id);
                if (id) {
                  const p = productos.find(x => String(x.id) === String(id));
                  if (p) setInputProducto(`${p.id} - ${p.nombre}`);
                } else setInputProducto('');
              }}
            >
              <option value="">—</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.nombre}
                </option>
              ))}
            </select>
            <small className="text-muted">O escribe el ID o nombre</small>
          </div>

          <div className="mb-2 position-relative">
            <input
              className="form-control"
              placeholder="ID o nombre del producto"
              value={inputProducto}
              onChange={(e) => {
                const entrada = e.target.value;
                setInputProducto(entrada);
                setProductoSeleccionado('');
                setSugerenciasProducto(filtrarSugerencias(entrada, productos, 'nombre'));
              }}
            />
            {inputProducto && sugerenciasProducto.length > 0 && (
              <ul className="list-group position-absolute z-3 w-100">
                {sugerenciasProducto.map(p => (
                  <li
                    key={p.id}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setInputProducto(`${p.id} - ${p.nombre}`);
                      setProductoSeleccionado(p.id);
                      setSugerenciasProducto([]);
                    }}
                  >
                    {p.id} - {p.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className="btn btn-warning w-100">Inhabilitar / Reactivar Producto</button>
        </form>
      </section>

      <hr className="my-4" />

      {/* Proveedor */}
      <section>
        <h6>Proveedor</h6>
        <form onSubmit={handleToggleProveedor}>
          <div className="mb-2">
            <label className="form-label">Selecciona un proveedor</label>
            <select
              className="form-select"
              value={proveedorSeleccionado}
              onChange={(e) => {
                const id = e.target.value;
                setProveedorSeleccionado(id);
                if (id) {
                  const p = proveedores.find(x => String(x.id) === String(id));
                  if (p) setInputProveedor(`${p.id} - ${p.nombre}`);
                } else setInputProveedor('');
              }}
            >
              <option value="">—</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.nombre}
                </option>
              ))}
            </select>
            <small className="text-muted">O escribe el ID o nombre</small>
          </div>

          <div className="mb-2 position-relative">
            <input
              className="form-control"
              placeholder="ID o nombre del proveedor"
              value={inputProveedor}
              onChange={(e) => {
                const entrada = e.target.value;
                setInputProveedor(entrada);
                setProveedorSeleccionado('');
                setSugerenciasProveedor(filtrarSugerencias(entrada, proveedores, 'nombre'));
              }}
            />
            {inputProveedor && sugerenciasProveedor.length > 0 && (
              <ul className="list-group position-absolute z-3 w-100">
                {sugerenciasProveedor.map(p => (
                  <li
                    key={p.id}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setInputProveedor(`${p.id} - ${p.nombre}`);
                      setProveedorSeleccionado(p.id);
                      setSugerenciasProveedor([]);
                    }}
                  >
                    {p.id} - {p.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className="btn btn-warning w-100">Inhabilitar / Reactivar Proveedor</button>
        </form>
      </section>

      <hr className="my-4" />

      {/* Categoría */}
      <section>
        <h6>Categoría</h6>
        <form onSubmit={handleToggleCategoria}>
          <div className="mb-2">
            <label className="form-label">Selecciona una categoría</label>
            <select
              className="form-select"
              value={categoriaSeleccionada}
              onChange={(e) => {
                const nombre = e.target.value;
                setCategoriaSeleccionada(nombre);
                if (nombre) setInputCategoria(nombre);
                else setInputCategoria('');
              }}
            >
              <option value="">—</option>
              {categorias.map(c => (
                <option key={c.id} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <small className="text-muted">O escribe el nombre</small>
          </div>

          <div className="mb-2 position-relative">
            <input
              className="form-control"
              placeholder="Nombre de la categoría"
              value={inputCategoria}
              onChange={(e) => {
                const entrada = e.target.value;
                setInputCategoria(entrada);
                setCategoriaSeleccionada('');
                setSugerenciasCategoria(filtrarSugerencias(entrada, categorias, 'nombre'));
              }}
            />
            {inputCategoria && sugerenciasCategoria.length > 0 && (
              <ul className="list-group position-absolute z-3 w-100">
                {sugerenciasCategoria.map(c => (
                  <li
                    key={c.id}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setInputCategoria(c.nombre);
                      setCategoriaSeleccionada(c.nombre);
                      setSugerenciasCategoria([]);
                    }}
                  >
                    {c.id} - {c.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className="btn btn-warning w-100">Inhabilitar / Reactivar Categoría</button>
        </form>
      </section>

      <hr className="my-4" />

      {/* Usuario */}
      <section>
        <h6>Usuario</h6>
        {usuariosLoading && <small className="text-muted">Cargando usuarios...</small>}
        {usuariosError && <small className="text-danger d-block">{usuariosError}</small>}
        <form onSubmit={handleToggleUsuario}>
          <div className="mb-2">
            <label className="form-label">Selecciona un usuario</label>
            <select
              className="form-select"
              value={usuarioSeleccionado}
              onChange={(e) => {
                const id = e.target.value;
                setUsuarioSeleccionado(id);
                if (id) {
                  const u = usuarios.find(x => String(x.id) === String(id));
                  setInputUsuario(`${u?.id} - ${u?.display_name}`);
                } else {
                  setInputUsuario('');
                }
              }}
            >
              <option value="">—</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>
                  {u.id} - {u.display_name}
                </option>
              ))}
            </select>
            <small className="text-muted">O escribe el ID o nombre</small>
          </div>

          <div className="mb-2 position-relative">
            <input
              className="form-control"
              placeholder="ID o nombre del usuario"
              value={inputUsuario}
              onChange={(e) => {
                const entrada = e.target.value;
                setInputUsuario(entrada);
                setUsuarioSeleccionado('');
                setSugerenciasUsuario(filtrarSugerencias(entrada, usuarios, 'display_name'));
              }}
            />
            {inputUsuario && sugerenciasUsuario.length > 0 && (
              <ul className="list-group position-absolute z-3 w-100">
                {sugerenciasUsuario.map(u => (
                  <li
                    key={u.id}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setInputUsuario(`${u.id} - ${u.display_name}`);
                      setUsuarioSeleccionado(u.id);
                      setSugerenciasUsuario([]);
                    }}
                  >
                    {u.id} - {u.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className="btn btn-warning w-100">Inhabilitar / Reactivar Usuario</button>
        </form>
      </section>
    </div>
  );
};

export default GestionarEstadoTab;