// src/components/Admin/GestionarEstadoTab.jsx
import React, { useState, useEffect } from 'react';
// Asumimos que fetch o axios están disponibles globalmente o se importan aquí si es necesario
// import axios from 'axios'; // Opción con axios

const normalizeDeletedAt = (val) => {
  if (val === null || val === undefined) return null;
  const s = String(val).trim().toLowerCase();
  if (s === '' || s === 'null' || s === 'undefined') return null;
  return val;
};

const isDisabled = (deletedAt) => normalizeDeletedAt(deletedAt) !== null;

const GestionarEstadoTab = ({
  onToggleProducto,
  onToggleProveedor,
  onToggleCategoria,
  onToggleUsuario, // <--- Esta prop ES obligatoria ahora para usuarios
  onAfterToggle,
  productos: productosProp = [],
  proveedores: proveedoresProp = [],
  categorias: categoriasProp = [],
  usuarios: usuariosProp = [] // opcional: pasar desde AdminView
}) => {
  // -------------------- Normalización inicial --------------------
  const normalizeProductoForState = (p = {}) => ({
    ...p,
    // garantizar id consistente para búsquedas y selects
    id: p.id ?? p.product_id ?? String(p.product_id ?? ''),
    deleted_at: normalizeDeletedAt(p.deleted_at)
  });

  const [productos, setProductos] = useState(
    Array.isArray(productosProp) ? productosProp.map(normalizeProductoForState) : []
  );

  // Producto
  const [inputProducto, setInputProducto] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [sugerenciasProducto, setSugerenciasProducto] = useState([]);

  // Proveedor
  const [inputProveedor, setInputProveedor] = useState('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [sugerenciasProveedor, setSugerenciasProveedor] = useState([]);
  const [proveedores, setProveedores] = useState(Array.isArray(proveedoresProp) ? proveedoresProp : []);

  // Categoría
  const [inputCategoria, setInputCategoria] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [sugerenciasCategoria, setSugerenciasCategoria] = useState([]);
  const [categorias, setCategorias] = useState(Array.isArray(categoriasProp) ? categoriasProp : []);

  // Usuario (Ahora solo se maneja vía API)
  const [inputUsuario, setInputUsuario] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [sugerenciasUsuario, setSugerenciasUsuario] = useState([]);
  const [usuarios, setUsuarios] = useState(
    Array.isArray(usuariosProp) ? usuariosProp.map(u => ({ ...u, deleted_at: normalizeDeletedAt(u.deleted_at) })) : []
  );
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuariosError, setUsuariosError] = useState('');

  // -------------------- Sincronizar props entrantes con estados locales --------------------
  useEffect(() => {
    setProductos(Array.isArray(productosProp) ? productosProp.map(normalizeProductoForState) : []);
  }, [productosProp]);

  useEffect(() => {
    setProveedores(Array.isArray(proveedoresProp) ? proveedoresProp : []);
  }, [proveedoresProp]);

  useEffect(() => {
    setCategorias(Array.isArray(categoriasProp) ? categoriasProp : []);
  }, [categoriasProp]);

  // Sincronizar usuarios desde props (opcional)
  useEffect(() => {
    if (usuariosProp && Array.isArray(usuariosProp)) {
      setUsuarios(usuariosProp.map(u => ({ ...u, deleted_at: normalizeDeletedAt(u.deleted_at) })));
    }
  }, [usuariosProp]);

  // -------------------- Cargas iniciales (si no vienen por props) --------------------
  useEffect(() => {
    let Mounted = true; // Cambiado a mayúscula para evitar error de ESLint
    if (!proveedoresProp || proveedoresProp.length === 0) {
      // Lógica para proveedores si no vienen por props (puede ser vía API o Supabase)
      // Ejemplo con Supabase (ajusta según AdminView):
      // import { supabase } from '@/services/supabaseClient';
      // supabase
      //   .from('proveedores')
      //   .select('*')
      //   .order('nombre', { ascending: true })
      //   .then(({ data, error }) => {
      //     if (error) console.error('Error al cargar proveedores:', error);
      //     else if (Mounted) setProveedores(data || []);
      //   });
    }
    return () => { Mounted = false; };
  }, [proveedoresProp]);

  useEffect(() => {
    let Mounted = true; // Cambiado a mayúscula para evitar error de ESLint
    if (!categoriasProp || categoriasProp.length === 0) {
      // Lógica para categorias si no vienen por props (puede ser vía API o Supabase)
      // Ejemplo con Supabase (ajusta según AdminView):
      // import { supabase } from '@/services/supabaseClient';
      // supabase
      //   .from('categorias')
      //   .select('*')
      //   .order('nombre', { ascending: true })
      //   .then(({ data, error }) => {
      //     if (error) console.error('Error al cargar categorías:', error);
      //     else if (Mounted) setCategorias(data || []);
      //   });
    }
    return () => { Mounted = false; };
  }, [categoriasProp]);

  // Carga inicial de USUARIOS desde la API (o props)
  useEffect(() => {
    let Mounted = true; // Cambiado a mayúscula para evitar error de ESLint
    const needFetch = !usuariosProp || usuariosProp.length === 0;
    if (!needFetch) return () => { Mounted = false; };

    const fetchUsuarios = async () => {
      setUsuariosLoading(true);
      setUsuariosError('');

      try {
        // Asumimos que AdminView ya cargó la lista inicial de usuarios vía API
        // y la pasó como prop. Si no, aquí iría la llamada a GET /api/usuarios.
        // Por ahora, solo mostramos un mensaje si no hay datos.
        console.warn("GestionarEstadoTab: usuarios no cargados por props. AdminView debería manejar esto.");
        // Si necesitas cargar aquí, descomenta y ajusta:
        // const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:10000'; // ESLint no reconoce process.env, pero es común en React.
        // const includeInactivos = true; // Siempre traer inactivos para gestionar estado
        // const url = `${API_BASE_URL}/api/usuarios?include_inactivos=${includeInactivos}`;
        // const token = localStorage.getItem('token'); // O desde tu contexto de autenticación
        // const headers = { 'Content-Type': 'application/json' };
        // if (token) headers['Authorization'] = `Bearer ${token}`;
        // const response = await fetch(url, { headers });
        // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // const data = await response.json();
        // if (Array.isArray(data)) {
        //   const normalized = data.map(u => ({
        //     id: u.id,
        //     display_name: u.username || u.email || u.nombres || u.id,
        //     deleted_at: normalizeDeletedAt(u.deleted_at),
        //     ...u
        //   }));
        //   if (Mounted) setUsuarios(normalized);
        // } else {
        //   if (Mounted) setUsuarios([]);
        // }
      } catch (err) {
        console.error('Error fetching usuarios via API:', err);
        if (Mounted) setUsuariosError('No fue posible cargar usuarios desde la API.');
      } finally {
        if (Mounted) setUsuariosLoading(false);
      }
    };

    fetchUsuarios();
    return () => { Mounted = false; };
  }, [usuariosProp]); // Remueve getAuthToken de la dependencia si lo usas como variable global o importación


  // -------------------- Utilidades --------------------
  /**
   * filtrarSugerencias:
   * - Si el texto es solo dígitos, busca por ID exacto (no por nombre).
   * - Si el texto tiene formato "ID - Nombre", extrae el ID y busca por ID exacto si existe.
   * - En otros casos busca por coincidencia parcial en el campo indicado (case-insensitive).
   * - idField por defecto es 'id' y se usa para la búsqueda numérica/exacta.
   */
  const filtrarSugerencias = (texto, lista, campo, idField = 'id') => {
    const raw = String(texto || '').trim();
    if (!raw) return [];
    // Si tiene formato "ID - Nombre", extraer ID y priorizar búsqueda por ID exacto
    if (raw.includes(' - ')) {
      const maybeId = raw.split(' - ')[0].trim();
      if (maybeId) {
        const found = lista.filter(item => String(item[idField] ?? item.id ?? '').trim() === maybeId);
        if (found.length > 0) return found.slice(0, 8);
        // si no existe exacto, no caer en búsqueda por nombre con ese fragmento
      }
    }
    // Si el usuario escribió solo dígitos, buscar por ID exacto (no por nombre)
    if (/^\d+$/.test(raw)) {
      return lista
        .filter(item => String(item[idField] ?? item.id ?? '').trim() === raw)
        .slice(0, 8);
    }
    // Búsqueda por nombre parcial (case-insensitive)
    const qLower = raw.toLowerCase();
    return lista
      .filter(item => String(item[campo] ?? '').toLowerCase().includes(qLower))
      .slice(0, 8);
  };

  /**
   * parseIdFromInputGeneric mejorado:
   * - Si la entrada tiene formato "ID - Nombre" devuelve ID.
   * - Si la entrada es solo dígitos devuelve ID exacto (no parcial).
   * - Si la entrada coincide exactamente con algún id en la lista devuelve ese id.
   * - Si no, intenta coincidencia por nombre exacta o parcial.
   * - Nunca devuelve un ID basado en coincidencias en campos numéricos (precio/stock).
   */
  const parseIdFromInputGeneric = (entrada, lista = [], idField = 'id', nameField = 'nombre') => {
    const raw = String(entrada || '').trim();
    if (!raw) return '';
    // 1) Formato "ID - Nombre" -> extraer ID y devolverlo si es plausible
    if (raw.includes(' - ')) {
      const maybeId = raw.split(' - ')[0].trim();
      if (maybeId) {
        const exists = lista.find(item => String(item[idField]) === maybeId);
        if (exists) return maybeId;
        // permitir devolver maybeId solo si es un id plausible (solo dígitos o uuid-like)
        if (/^\d+$/.test(maybeId) || /^[0-9a-fA-F-]{8,}$/.test(maybeId)) return maybeId;
        // si no es plausible, continuar con búsqueda por nombre
      }
    }
    // 2) Si la entrada es solo dígitos -> buscar ID exacto (no parcial)
    if (/^\d+$/.test(raw)) {
      const foundById = lista.find(item => String(item[idField]) === raw);
      if (foundById) return String(foundById[idField]);
      // si no se encuentra por id exacto, no intentar coincidencias parciales con otros campos
      return '';
    }
    // 3) Si la entrada parece un UUID o id alfanumérico largo -> buscar ID exacto
    if (/^[0-9a-fA-F-]{8,}$/.test(raw)) {
      const foundById = lista.find(item => String(item[idField]) === raw);
      if (foundById) return String(foundById[idField]);
      return '';
    }
    // 4) Buscar por nombre exacto (case-insensitive)
    const byNameExact = lista.find(item => String(item[nameField] ?? '').toLowerCase() === raw.toLowerCase());
    if (byNameExact) return String(byNameExact[idField]);
    // 5) Buscar por nombre parcial (case-insensitive)
    const byNamePartial = lista.find(item => String(item[nameField] ?? '').toLowerCase().includes(raw.toLowerCase()));
    if (byNamePartial) return String(byNamePartial[idField]);
    // 6) Fallback: si raw coincide exactamente con algún id en la lista (por seguridad)
    const byIdExact = lista.find(item => String(item[idField]) === raw);
    if (byIdExact) return String(byIdExact[idField]);
    // No se encontró un id confiable
    return '';
  };

  // Actualiza localmente la lista de productos (optimista)
  const applyLocalToggleProducto = (id, currentlyDisabled) => {
    const now = !currentlyDisabled ? new Date().toISOString() : null;
    setProductos(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, deleted_at: now } : p)));
  };

  // Actualiza localmente la lista de usuarios (optimista)
  const applyLocalToggleUsuario = (id, currentlyDisabled) => {
    const now = !currentlyDisabled ? null : new Date().toISOString(); // Si estaba deshabilitado, ahora se habilita (deleted_at = null)
    setUsuarios(prev => prev.map(u => (String(u.id) === String(id) ? { ...u, deleted_at: now } : u)));
  };

  // -------------------- Handlers --------------------
  const handleToggleProducto = async (e) => {
    e.preventDefault();
    // resolver id: prioriza select, luego input
    let idFinal = productoSeleccionado || parseIdFromInputGeneric(inputProducto, productos, 'id', 'nombre');
    if (!idFinal) return alert('Selecciona un producto o ingresa un ID/nombre válido.');

    const prod = productos.find(p => String(p.id) === String(idFinal));
    if (!prod) return alert('No se encontró ningún producto con ese ID o nombre.');

    const currentlyDisabled = isDisabled(prod.deleted_at);
    if (!window.confirm(currentlyDisabled ? '¿Reactivar este producto?' : '¿Inhabilitar este producto?')) return;

    // Si el padre provee onToggleProducto, lo usamos y esperamos su resultado
    if (typeof onToggleProducto === 'function') {
      try {
        const ok = await onToggleProducto(idFinal, currentlyDisabled);
        if (!ok) {
          alert('No fue posible cambiar el estado del producto.');
          return;
        }
        // El padre (AdminView) recargará o actualizará su estado; sincronizamos localmente también
        applyLocalToggleProducto(idFinal, currentlyDisabled);
        if (typeof onAfterToggle === 'function') {
          try { await onAfterToggle('productos'); } catch (err) { console.error('onAfterToggle error:', err); }
        }
        setInputProducto(''); setProductoSeleccionado(''); setSugerenciasProducto([]);
        return;
      } catch (err) {
        console.error('onToggleProducto error:', err);
        alert('Error al comunicarse con el servidor al cambiar el estado del producto.');
        return;
      }
    }

    // Si no hay onToggleProducto, usar fallback directo a Supabase y devolver la fila actualizada al padre
    // Intentar por product_id primero, si no funciona intentar por id
    // let updatedRow = await applyToggleFallback({ table: 'productos', id: idFinal, currentlyDisabled, idColumn: 'product_id' });
    // if (!updatedRow) {
    //   // intentar con id
    //   updatedRow = await applyToggleFallback({ table: 'productos', id: idFinal, currentlyDisabled, idColumn: 'id' });
    //   if (!updatedRow) return; // ya mostró alerta en applyToggleFallback
    // }
    // // Actualización optimista local
    // applyLocalToggleProducto(idFinal, currentlyDisabled);
    // // Notificar al padre con la fila actualizada (si existe)
    // if (typeof onAfterToggle === 'function') {
    //   try {
    //     await onAfterToggle('productos', updatedRow ? { id: updatedRow.product_id ?? updatedRow.id, deleted_at: updatedRow.deleted_at } : null);
    //   } catch (err) {
    //     console.error('onAfterToggle error:', err);
    //   }
    // }
    // // limpiar inputs
    // setInputProducto(''); setProductoSeleccionado(''); setSugerenciasProducto([]);
  };

  const handleToggleProveedor = async (e) => {
    e.preventDefault();
    let idFinal = proveedorSeleccionado || parseIdFromInputGeneric(inputProveedor, proveedores, 'id', 'nombre');
    if (!idFinal) return alert('Selecciona un proveedor o ingresa un ID/nombre válido.');

    const prov = proveedores.find(p => String(p.id) === String(idFinal));
    if (!prov) return alert('No se encontró ningún proveedor con ese ID o nombre.');

    const currentlyDisabled = isDisabled(prov.deleted_at);
    if (!window.confirm(currentlyDisabled ? '¿Reactivar este proveedor?' : '¿Inhabilitar este proveedor?')) return;

    if (typeof onToggleProveedor === 'function') {
      try {
        const ok = await onToggleProveedor(idFinal, currentlyDisabled);
        if (!ok) { alert('No fue posible cambiar el estado del proveedor.'); return; }
      } catch (err) {
        console.error('onToggleProveedor error:', err);
        alert('Error al cambiar el estado del proveedor.');
        return;
      }
    } else {
      // const updated = await applyToggleFallback({ table: 'proveedores', id: idFinal, currentlyDisabled, idColumn: 'id' });
      // if (!updated) return;
    }

    // Actualización optimista local
    const now = !currentlyDisabled ? new Date().toISOString() : null;
    setProveedores(prev => prev.map(p => (String(p.id) === String(idFinal) ? { ...p, deleted_at: now } : p)));

    if (typeof onAfterToggle === 'function') {
      try { await onAfterToggle('proveedores'); } catch (err) { console.error('onAfterToggle proveedores error:', err); }
    }

    setInputProveedor(''); setProveedorSeleccionado(''); setSugerenciasProveedor([]);
  };

  const handleToggleCategoria = async (e) => {
    e.preventDefault();
    let idFinal = categoriaSeleccionada || parseIdFromInputGeneric(inputCategoria, categorias, 'id', 'nombre');
    if (!idFinal && categoriaSeleccionada) idFinal = categoriaSeleccionada;

    let cat = categorias.find(c => String(c.id) === String(idFinal));
    if (!cat && inputCategoria) {
      cat = categorias.find(c => String(c.nombre).toLowerCase() === String(inputCategoria).trim().toLowerCase())
        || categorias.find(c => String(c.nombre).toLowerCase().includes(String(inputCategoria).trim().toLowerCase()));
      if (cat) idFinal = cat.id;
    }

    if (!cat) return alert('No se encontró ninguna categoría con ese ID o nombre.');

    const currentlyDisabled = isDisabled(cat.deleted_at);
    if (!window.confirm(currentlyDisabled ? '¿Reactivar esta categoría?' : '¿Inhabilitar esta categoría?')) return;

    if (typeof onToggleCategoria === 'function') {
      try {
        const ok = await onToggleCategoria(idFinal, currentlyDisabled);
        if (!ok) { alert('No fue posible cambiar el estado de la categoría.'); return; }
      } catch (err) {
        console.error('onToggleCategoria error:', err);
        alert('Error al cambiar el estado de la categoría.');
        return;
      }
    } else {
      // const updated = await applyToggleFallback({ table: 'categorias', id: idFinal, currentlyDisabled, idColumn: 'id' });
      // if (!updated) return;
    }

    const now = !currentlyDisabled ? new Date().toISOString() : null;
    setCategorias(prev => prev.map(c => (String(c.id) === String(idFinal) ? { ...c, deleted_at: now } : c)));

    if (typeof onAfterToggle === 'function') {
      try { await onAfterToggle('categorias'); } catch (err) { console.error('onAfterToggle categorias error:', err); }
    }

    setInputCategoria(''); setCategoriaSeleccionada(''); setSugerenciasCategoria([]);
  };

  // HANDLER PARA USUARIO - AHORA SOLO USA onToggleUsuario (la función de AdminView)
  const handleToggleUsuario = async (e) => {
    e.preventDefault();

    // resolver id: prioriza select, luego input
    let idFinal = parseIdFromInputGeneric(inputUsuario, usuarios, 'id', 'display_name') || usuarioSeleccionado;
    if (!idFinal && usuarioSeleccionado) idFinal = usuarioSeleccionado;

    let user = usuarios.find(u => String(u.id) === String(idFinal));
    if (!user && inputUsuario) {
      // Buscar por display_name si no se encontró por ID
      user = usuarios.find(u => String(u.display_name).toLowerCase() === String(inputUsuario).trim().toLowerCase());
      if (user) idFinal = user.id;
    }

    if (!user) {
      alert('No se encontró ningún usuario con ese nombre o ID.');
      return;
    }

    const currentlyDisabled = isDisabled(user.deleted_at);
    if (!window.confirm(currentlyDisabled ? '¿Reactivar este usuario?' : '¿Inhabilitar este usuario?')) return;

    // VALIDAR que onToggleUsuario esté definida
    if (typeof onToggleUsuario !== 'function') {
        console.error("GestionarEstadoTab: onToggleUsuario no está definida. AdminView debe proporcionar esta función.");
        alert("Error: No se puede gestionar el estado del usuario. Contacta al administrador.");
        return;
    }

    try {
      // Llamar a la función proporcionada por AdminView
      const ok = await onToggleUsuario(idFinal, currentlyDisabled);
      if (!ok) {
        alert('No fue posible cambiar el estado del usuario.');
        return;
      }

      // Actualización optimista local
      applyLocalToggleUsuario(idFinal, currentlyDisabled);

      // Notificar al padre para recargar datos si es necesario
      if (typeof onAfterToggle === 'function') {
        try {
          await onAfterToggle('usuarios'); // Esto debería recargar la lista de usuarios en AdminView
        } catch (err) {
          console.error('onAfterToggle usuarios error:', err);
        }
      }

      // Limpiar inputs
      setInputUsuario('');
      setUsuarioSeleccionado('');
      setSugerenciasUsuario([]);

    } catch (err) {
      console.error('Error al cambiar estado del usuario via AdminView handler:', err);
      alert(`Ocurrió un error al comunicarse con el servidor: ${err.message}`);
    }
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
                  if (p) setInputProducto(`${p.id} - ${p.nombre ?? p._raw?.nombre ?? ''}`);
                } else setInputProducto('');
              }}
            >
              <option value="">—</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.nombre ?? p._raw?.nombre ?? ''}
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
                // Usar filtrarSugerencias que prioriza ID exacto cuando el usuario escribe solo dígitos
                setSugerenciasProducto(filtrarSugerencias(entrada, productos, 'nombre', 'id'));
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
                      setInputProducto(`${p.id} - ${p.nombre ?? p._raw?.nombre ?? ''}`);
                      setProductoSeleccionado(p.id);
                      setSugerenciasProducto([]);
                    }}
                  >
                    {p.id} - {p.nombre ?? p._raw?.nombre ?? ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="btn btn-warning">Inhabilitar / Reactivar Producto</button>
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
                setSugerenciasProveedor(filtrarSugerencias(entrada, proveedores, 'nombre', 'id'));
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
          <button type="submit" className="btn btn-warning">Inhabilitar / Reactivar Proveedor</button>
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
          <button type="submit" className="btn btn-warning">Inhabilitar / Reactivar Categoría</button>
        </form>
      </section>
      <hr className="my-4" />

      {/* Usuario - Ahora solo llama a onToggleUsuario */}
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
                  setInputUsuario(u?.display_name || '');
                } else {
                  setInputUsuario('');
                }
              }}
            >
              <option value="">—</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>
                  {u.display_name} ({isDisabled(u.deleted_at) ? 'Inactivo' : 'Activo'})
                </option>
              ))}
            </select>
            <small className="text-muted">O escribe el nombre del usuario</small>
          </div>
          <div className="mb-2 position-relative">
            <input
              className="form-control"
              placeholder="Nombre del usuario"
              value={inputUsuario}
              onChange={(e) => {
                const entrada = e.target.value;
                setInputUsuario(entrada);
                setUsuarioSeleccionado('');
                setSugerenciasUsuario(filtrarSugerencias(entrada, usuarios, 'display_name', 'id'));
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
                      setInputUsuario(u.display_name);
                      setUsuarioSeleccionado(u.id);
                      setSugerenciasUsuario([]);
                    }}
                  >
                    {u.display_name} ({isDisabled(u.deleted_at) ? 'Inactivo' : 'Activo'})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="btn btn-warning">Inhabilitar / Reactivar Usuario</button>
        </form>
      </section>
    </div>
  );
};

export default GestionarEstadoTab;