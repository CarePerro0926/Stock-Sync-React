// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import '../ResponsiveTable.css';
import ResponsiveTable from '../ResponsiveTable';

// Ahora acepta onToggleProducto: (id, currentlyDisabled) => Promise
const InventoryTab = ({ productos = [], categorias = [], onToggleProducto }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false); // opcional: ver inactivos

  useEffect(() => {
    console.log('--- DATOS EN INVENTORYTAB ---');
    console.log('Productos recibidos:', productos);
    console.log('Categorías recibidas:', categorias);
  }, [productos, categorias]);

  const listaCategoriasFiltro = useMemo(() => {
    const nombresDesdeProductos = (productos || [])
      .map(p => p.categoria_nombre)
      .filter(nombre => nombre && String(nombre).trim() !== '');
    const unicas = [...new Set(nombresDesdeProductos.map(nombre => String(nombre).trim()))];
    return ['Todas', ...unicas];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    // Si la lista viene con deleted_at, por defecto mostramos solo activos
    let filtered = [...(productos || [])];

    if (!mostrarInactivos) {
      filtered = filtered.filter(p => p.deleted_at == null);
    }

    if (filtroCat !== 'Todas') {
      const filtroCatStr = String(filtroCat).trim();
      filtered = filtered.filter(p => {
        const nombreCategoria = p.categoria_nombre;
        return nombreCategoria && String(nombreCategoria).trim() === filtroCatStr;
      });
    }

    if (filtroTxt.trim()) {
      const term = filtroTxt.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const idStr = String(p.id ?? '');
        const nombreStr = String(p.nombre ?? '');
        const catStr = String(p.categoria_nombre ?? '');
        return (
          idStr.toLowerCase().includes(term) ||
          nombreStr.toLowerCase().includes(term) ||
          catStr.toLowerCase().includes(term)
        );
      });
    }

    return filtered;
  }, [productos, filtroCat, filtroTxt, mostrarInactivos]);

  const tableData = useMemo(() => {
    return productosFiltrados.map(p => {
      let nombreCategoria = p.categoria_nombre ? String(p.categoria_nombre).trim() : 'Sin Categoría';
      if (!nombreCategoria || nombreCategoria === 'null' || nombreCategoria === 'undefined' || nombreCategoria === '') {
        nombreCategoria = 'Sin Categoría';
      }

      // Acción: botón que llama a onToggleProducto si está definido
      const estaInhabilitado = !!p.deleted_at;
      const accion = (
        <button
          className={`btn btn-sm ${estaInhabilitado ? 'btn-success' : 'btn-warning'}`}
          onClick={async () => {
            if (!onToggleProducto) {
              alert('No hay función para inhabilitar/reactivar. Contacta al administrador.');
              return;
            }
            const confirmMsg = estaInhabilitado
              ? '¿Deseas reactivar este producto?'
              : '¿Deseas inhabilitar este producto?';
            if (!window.confirm(confirmMsg)) return;
            try {
              await onToggleProducto(p.id, estaInhabilitado);
            } catch (err) {
              console.error(err);
              alert('Ocurrió un error al cambiar el estado del producto.');
            }
          }}
        >
          {estaInhabilitado ? 'Reactivar' : 'Inhabilitar'}
        </button>
      );

      return {
        id: p.id ?? '—',
        nombre: p.nombre ?? 'Sin nombre',
        categoriaNombre: nombreCategoria,
        cantidad: p.cantidad ?? 0,
        precio: typeof p.precio === 'number'
          ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })
          : p.precio ?? '—',
        accion // campo extra con el botón
      };
    });
  }, [productosFiltrados, onToggleProducto]);

  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoriaNombre', label: 'Categoría' },
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' },
    { key: 'accion', label: 'Acción', align: 'center' } // nueva columna
  ];

  return (
    <div className="w-100">
      <h5>Inventario</h5>

      <div className="row g-2 mb-3">
        <div className="col">
          <select
            id="filtroCatAdmin"
            className="form-select"
            value={filtroCat}
            onChange={e => setFiltroCat(e.target.value)}
          >
            {listaCategoriasFiltro.map((cat, index) => (
              <option key={`${cat}-${index}`} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="col">
          <input
            id="filtroTxtAdmin"
            className="form-control"
            placeholder="Buscar por ID, nombre o categoría..."
            value={filtroTxt}
            onChange={e => setFiltroTxt(e.target.value)}
          />
        </div>

        <div className="col-auto d-flex align-items-center">
          <div className="form-check">
            <input
              id="chkMostrarInactivos"
              className="form-check-input"
              type="checkbox"
              checked={mostrarInactivos}
              onChange={e => setMostrarInactivos(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="chkMostrarInactivos">Mostrar inactivos</label>
          </div>
        </div>
      </div>

      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        <div className="table-responsive">
          <ResponsiveTable
            headers={tableHeaders}
            data={tableData}
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;