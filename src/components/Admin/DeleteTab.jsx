// src/components/Admin/DeleteTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';  // Ajusta la ruta según tu estructura

const DeleteTab = ({
  onDeleteProducto,
  onDeleteProveedor,
  onDeleteCategoria,
  productos = [],
  proveedores: proveedoresProp = [],
  categorias: categoriasProp = []
}) => {
  const [inputProducto, setInputProducto] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');

  const [inputProveedor, setInputProveedor] = useState('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [proveedores, setProveedores] = useState(proveedoresProp);

  const [inputCategoria, setInputCategoria] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [categorias, setCategorias] = useState(categoriasProp);

  // Cargar proveedores si no vienen como props
  useEffect(() => {
    let mounted = true;
    if (!proveedoresProp || proveedoresProp.length === 0) {
      supabase.from('proveedores').select('*').then(({ data, error }) => {
        if (error) {
          console.error('Error al cargar proveedores:', error);
        } else if (mounted) {
          setProveedores(data || []);
        }
      });
    } else {
      setProveedores(proveedoresProp);
    }
    return () => { mounted = false; };
  }, [proveedoresProp]);

  // Cargar categorías si no vienen como props
  useEffect(() => {
    let mounted = true;
    if (!categoriasProp || categoriasProp.length === 0) {
      supabase.from('categorias').select('*').then(({ data, error }) => {
        if (error) {
          console.error('Error al cargar categorías:', error);
        } else if (mounted) {
          setCategorias(data || []);
        }
      });
    } else {
      setCategorias(categoriasProp);
    }
    return () => { mounted = false; };
  }, [categoriasProp]);

  const handleDeleteProducto = (e) => {
    e.preventDefault();
    const entrada = String(inputProducto || '').trim();
    const seleccion = productoSeleccionado;
    let idFinal = '';

    if (entrada) {
      const porId = productos.find(p => String(p.id) === entrada);
      if (porId) {
        idFinal = porId.id;
      } else {
        const porNombre = productos.find(p => String(p.nombre).toLowerCase() === entrada.toLowerCase());
        if (porNombre) {
          idFinal = porNombre.id;
        } else {
          alert('No se encontró ningún producto con ese ID o nombre.');
          return;
        }
      }
    } else if (seleccion) {
      idFinal = seleccion;
    } else {
      alert('Debes escribir o seleccionar un producto.');
      return;
    }

    if (onDeleteProducto) onDeleteProducto(idFinal);
    setInputProducto('');
    setProductoSeleccionado('');
    alert('Producto eliminado');
  };

  const handleDeleteProveedor = (e) => {
    e.preventDefault();
    const entrada = String(inputProveedor || '').trim();
    const seleccion = proveedorSeleccionado;
    let idFinal = '';

    if (entrada) {
      const porId = proveedores.find(p => String(p.id) === entrada);
      if (porId) {
        idFinal = porId.id;
      } else {
        const porNombre = proveedores.find(p => String(p.nombre).toLowerCase() === entrada.toLowerCase());
        if (porNombre) {
          idFinal = porNombre.id;
        } else {
          alert('No se encontró ningún proveedor con ese ID o nombre.');
          return;
        }
      }
    } else if (seleccion) {
      idFinal = seleccion;
    } else {
      alert('Debes escribir o seleccionar un proveedor.');
      return;
    }

    if (onDeleteProveedor) onDeleteProveedor(idFinal);
    setInputProveedor('');
    setProveedorSeleccionado('');
    alert('Proveedor eliminado');
  };

  const handleDeleteCategoria = (e) => {
    e.preventDefault();
    const entrada = String(inputCategoria || '').trim();
    const seleccion = categoriaSeleccionada;
    let nombreFinal = '';

    if (entrada) {
      const porId = categorias.find(c => String(c.id) === entrada);
      if (porId) {
        nombreFinal = porId.nombre;
      } else {
        const porNombre = categorias.find(c => String(c.nombre).toLowerCase() === entrada.toLowerCase());
        if (porNombre) {
          nombreFinal = porNombre.nombre;
        } else {
          alert('No se encontró ninguna categoría con ese ID o nombre.');
          return;
        }
      }
    } else if (seleccion) {
      nombreFinal = seleccion;
    } else {
      alert('Debes escribir o seleccionar una categoría.');
      return;
    }

    if (onDeleteCategoria) onDeleteCategoria(nombreFinal);
    setInputCategoria('');
    setCategoriaSeleccionada('');
    alert('Categoría eliminada');
  };

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
      {/* -------------------- Eliminar Producto -------------------- */}
      <h5>Eliminar Producto</h5>
      <form onSubmit={handleDeleteProducto}>
        <div className="mb-2">
          <label className="form-label">Selecciona un producto</label>
          <select
            className="form-select"
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
          >
            <option value="">—</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.nombre}
              </option>
            ))}
          </select>
          <small className="text-muted">Puedes seleccionar o escribir el ID o nombre.</small>
        </div>
        <div className="mb-2">
          <label className="form-label">O escribe el ID o nombre</label>
          <input
            className="form-control"
            placeholder="ID o nombre del producto"
            value={inputProducto}
            onChange={(e) => setInputProducto(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-danger w-100">
          Eliminar Producto
        </button>
      </form>

      <hr className="my-4" />

      {/* -------------------- Eliminar Proveedor -------------------- */}
      <h5>Eliminar Proveedor</h5>
      <form onSubmit={handleDeleteProveedor}>
        <div className="mb-2">
          <label className="form-label">Selecciona un proveedor</label>
          <select
            className="form-select"
            value={proveedorSeleccionado}
            onChange={(e) => setProveedorSeleccionado(e.target.value)}
          >
            <option value="">—</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.nombre}
              </option>
            ))}
          </select>
          <small className="text-muted">Puedes seleccionar o escribir el ID o nombre.</small>
        </div>
        <div className="mb-2">
          <label className="form-label">O escribe el ID o nombre</label>
          <input
            className="form-control"
            placeholder="ID o nombre del proveedor"
            value={inputProveedor}
            onChange={(e) => setInputProveedor(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-danger w-100">
          Eliminar Proveedor
        </button>
      </form>

      <hr className="my-4" />

      {/* -------------------- Eliminar Categoría -------------------- */}
      <h5>Eliminar Categoría</h5>
      <form onSubmit={handleDeleteCategoria}>
        <div className="mb-2">
          <label className="form-label">Selecciona una categoría</label>
          <select
            className="form-select"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="">—</option>
            {categorias.map(c => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
          <small className="text-muted">Puedes seleccionar o escribir el nombre directamente.</small>
        </div>
        <div className="mb-2">
          <label className="form-label">O escribe el nombre</label>
          <input
            className="form-control"
            placeholder="Nombre de la categoría"
            value={inputCategoria}
            onChange={(e) => setInputCategoria(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-danger w-100">
          Eliminar Categoría
        </button>
      </form>
    </div>
  );
};

export default DeleteTab;
