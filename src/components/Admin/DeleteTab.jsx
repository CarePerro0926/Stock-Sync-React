// src/components/Admin/DeleteTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';

const DeleteTab = ({
  onToggleProducto,
  onToggleProveedor,
  onToggleCategoria,
  productos = [],
  proveedores: proveedoresProp = [],
  categorias: categoriasProp = []
}) => {
  const [inputProducto, setInputProducto] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [sugerenciasProducto, setSugerenciasProducto] = useState([]);

  const [inputProveedor, setInputProveedor] = useState('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [sugerenciasProveedor, setSugerenciasProveedor] = useState([]);
  const [proveedores, setProveedores] = useState(proveedoresProp);

  const [inputCategoria, setInputCategoria] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [sugerenciasCategoria, setSugerenciasCategoria] = useState([]);
  const [categorias, setCategorias] = useState(categoriasProp);

  useEffect(() => {
    let mounted = true;
    if (!proveedoresProp || proveedoresProp.length === 0) {
      supabase.from('proveedores').select('*').order('nombre', { ascending: true })
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
      supabase.from('categorias').select('*').order('nombre', { ascending: true })
        .then(({ data, error }) => {
          if (error) console.error('Error al cargar categorías:', error);
          else if (mounted) setCategorias(data || []);
        });
    } else {
      setCategorias(categoriasProp);
    }
    return () => { mounted = false; };
  }, [categoriasProp]);

  const filtrarSugerencias = (texto, lista, campo) => {
    const q = String(texto || '').trim().toLowerCase();
    if (!q) return [];
    return lista.filter(item =>
      String(item.id).toLowerCase().includes(q) ||
      String(item[campo] ?? '').toLowerCase().includes(q)
    ).slice(0, 5);
  };

  const parseIdFromInput = (entrada) => {
    const trimmed = String(entrada || '').trim();
    if (!trimmed) return '';
    if (trimmed.includes(' - ')) {
      const parts = trimmed.split(' - ');
      return parts[0].trim();
    }
    return trimmed;
  };

  const applyToggleFallback = async ({ table, id, currentlyDisabled }) => {
    try {
      if (!id) throw new Error('ID inválido');
      const newDeletedAt = currentlyDisabled ? null : new Date().toISOString();
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: newDeletedAt })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Fallback toggle error:', err);
      return false;
    }
  };

  const handleToggleProducto = async (e) => {
    e.preventDefault();
    const entradaRaw = String(inputProducto || '').trim();
    const seleccion = productoSeleccionado;
    let idFinal = '';

    const entrada = parseIdFromInput(entradaRaw);

    if (entrada) {
      const porId = productos.find(p => String(p.id) === entrada);
      if (porId) idFinal = porId.id;
      else {
        const porNombre = productos.find(p => String(p.nombre).toLowerCase() === entrada.toLowerCase());
        if (porNombre) idFinal = porNombre.id;
      }
    } else if (seleccion) {
      idFinal = seleccion;
    }

    if (!idFinal) {
      alert('No se encontró ningún producto con ese ID o nombre.');
      return;
    }

    // determinar estado actual (buscar en productos)
    const prod = productos.find(p => String(p.id) === String(idFinal));
    const currentlyDisabled = !!(prod && prod.deleted_at);

    const confirmMsg = currentlyDisabled ? '¿Reactivar este producto?' : '¿Inhabilitar este producto?';
    if (!window.confirm(confirmMsg)) return;

    // usar callback del padre si existe
    if (typeof onToggleProducto === 'function') {
      await onToggleProducto(idFinal, currentlyDisabled);
    } else {
      const ok = await applyToggleFallback({ table: 'productos', id: idFinal, currentlyDisabled });
      if (!ok) {
        alert('Ocurrió un error al cambiar el estado del producto.');
        return;
      }
    }

    setInputProducto('');
    setProductoSeleccionado('');
    setSugerenciasProducto([]);
    alert(currentlyDisabled ? 'Producto reactivado' : 'Producto inhabilitado');
  };

  const handleToggleProveedor = async (e) => {
    e.preventDefault();
    const entradaRaw = String(inputProveedor || '').trim();
    const seleccion = proveedorSeleccionado;
    let idFinal = '';

    const entrada = parseIdFromInput(entradaRaw);

    if (entrada) {
      const porId = proveedores.find(p => String(p.id) === entrada);
      if (porId) idFinal = porId.id;
      else {
        const porNombre = proveedores.find(p => String(p.nombre).toLowerCase() === entrada.toLowerCase());
        if (porNombre) idFinal = porNombre.id;
      }
    } else if (seleccion) {
      idFinal = seleccion;
    }

    if (!idFinal) {
      alert('No se encontró ningún proveedor con ese ID o nombre.');
      return;
    }

    const prov = proveedores.find(p => String(p.id) === String(idFinal));
    const currentlyDisabled = !!(prov && prov.deleted_at);

    const confirmMsg = currentlyDisabled ? '¿Reactivar este proveedor?' : '¿Inhabilitar este proveedor?';
    if (!window.confirm(confirmMsg)) return;

    if (typeof onToggleProveedor === 'function') {
      await onToggleProveedor(idFinal, currentlyDisabled);
    } else {
      const ok = await applyToggleFallback({ table: 'proveedores', id: idFinal, currentlyDisabled });
      if (!ok) {
        alert('Ocurrió un error al cambiar el estado del proveedor.');
        return;
      }
    }

    setInputProveedor('');
    setProveedorSeleccionado('');
    setSugerenciasProveedor([]);
    alert(currentlyDisabled ? 'Proveedor reactivado' : 'Proveedor inhabilitado');
  };

  const handleToggleCategoria = async (e) => {
    e.preventDefault();
    const entradaRaw = String(inputCategoria || '').trim();
    const seleccion = categoriaSeleccionada;
    let idFinal = '';

    const entrada = parseIdFromInput(entradaRaw);

    if (entrada) {
      const porId = categorias.find(c => String(c.id) === entrada);
      if (porId) idFinal = porId.id;
      else {
        const porNombre = categorias.find(c => String(c.nombre).toLowerCase() === entrada.toLowerCase());
        if (porNombre) idFinal = porNombre.id;
      }
    } else if (seleccion) {
      // en select guardamos nombre; buscar id por nombre
      const porNombre = categorias.find(c => c.nombre === seleccion);
      if (porNombre) idFinal = porNombre.id;
    }

    if (!idFinal) {
      alert('No se encontró ninguna categoría con ese ID o nombre.');
      return;
    }

    const cat = categorias.find(c => String(c.id) === String(idFinal));
    const currentlyDisabled = !!(cat && cat.deleted_at);

    const confirmMsg = currentlyDisabled ? '¿Reactivar esta categoría?' : '¿Inhabilitar esta categoría?';
    if (!window.confirm(confirmMsg)) return;

    if (typeof onToggleCategoria === 'function') {
      await onToggleCategoria(idFinal, currentlyDisabled);
    } else {
      const ok = await applyToggleFallback({ table: 'categorias', id: idFinal, currentlyDisabled });
      if (!ok) {
        alert('Ocurrió un error al cambiar el estado de la categoría.');
        return;
      }
    }

    setInputCategoria('');
    setCategoriaSeleccionada('');
    setSugerenciasCategoria([]);
    alert(currentlyDisabled ? 'Categoría reactivada' : 'Categoría inhabilitada');
  };

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
                } else {
                  setInputProducto('');
                }
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
                } else {
                  setInputProveedor('');
                }
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
    </div>
  );
};

export default DeleteTab;