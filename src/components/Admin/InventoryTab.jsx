// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import ResponsiveTable from '../ResponsiveTable';
// Importamos la función externa de filtrado
import { filtroProductos } from '../../utils/helpers';

const InventoryTab = ({ productos = [], categorias = [], onDeleteProducto = () => {} }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');

  // DIAGNÓSTICO: Ver qué datos llegan
  useEffect(() => {
    console.log('--- DATOS EN INVENTORYTAB ---');
    console.log('Productos recibidos:', productos);
    console.log('Categorías recibidas:', categorias);
    if (productos.length > 0) {
      console.log('Ejemplo de producto:', productos[0]);
    }
    if (categorias.length > 0) {
      console.log('Ejemplo de categoría:', categorias[0]);
    }
  }, [productos, categorias]);

  // === 1. Lista de categorías para el filtro - Ahora solo usa producto.categoria ===
  const listaCategoriasFiltro = useMemo(() => {
    // Extraer nombres de categorías de los productos, usando solo p.categoria
    const nombresDesdeProductos = productos
      .map(p => p.categoria) // <-- Solo usa p.categoria
      .filter(nombre => nombre && String(nombre).trim() !== ''); // Filtrar valores vacíos o nulos

    const unicas = [...new Set(nombresDesdeProductos.map(nombre => String(nombre).trim()))];
    return ['Todas', ...unicas];
  }, [productos]); // Solo depende de productos ahora


  // === 2. Productos filtrados - Ahora usa la función externa ===
  const productosFiltrados = useMemo(() => {
    // Llama a la función externa en lugar de la lógica interna
    return filtroProductos(productos, filtroTxt, filtroCat); // <-- Usa filtroProductos
  }, [productos, filtroTxt, filtroCat]); // Dependencias para filtro externo


  // === 3. Datos para la tabla — SIEMPRE TEXTO PLANO ===
  const tableData = useMemo(() => {
    return productosFiltrados.map(p => {
      // Ahora asume que p.categoria es directamente el nombre
      let nombreCategoria = p.categoria ? String(p.categoria).trim() : 'Sin Categoría';

      // Garantizar que sea un string válido
      if (!nombreCategoria || nombreCategoria === 'null' || nombreCategoria === 'undefined' || nombreCategoria === '') {
        nombreCategoria = 'Sin Categoría'; // <-- Ahora es 'let', se puede reasignar
      }

      return {
        id: p.id ?? '—',
        nombre: p.nombre ?? 'Sin nombre',
        categoriaNombre: nombreCategoria, // ← TEXTO PLANO SIMPLE
        cantidad: p.cantidad ?? 0,
        precio: typeof p.precio === 'number'
          ? p.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })
          : p.precio ?? '—',
        acciones: (
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onDeleteProducto(p.id)}
            disabled={!p.id}
          >
            Eliminar
          </button>
        )
      };
    });
  }, [productosFiltrados, categorias, onDeleteProducto]); // Incluir categorias aquí también


  // === 4. Cabeceras de la tabla ===
  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoriaNombre', label: 'Categoría' },
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
  ];

  // DIAGNÓSTICO: Confirmar renderizado
  console.log("Renderizando InventoryTab con productos:", productos);

  return (
    <div>
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
              <option key={`${cat}-${index}`} value={cat}> {/* Usar índice como fallback para claves duplicadas */}
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
      </div>

      <ResponsiveTable
        headers={tableHeaders}
        data={tableData}
        maxHeight="250px"
      />
    </div>
  );
};

export default InventoryTab;