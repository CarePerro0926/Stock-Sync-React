// src/components/Admin/InventoryTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import ResponsiveTable from '../ResponsiveTable';

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

  // === 1. Lista de categorías para el filtro - CORREGIDO ===
  const listaCategoriasFiltro = useMemo(() => {
    // Extraer nombres de categorías de los productos
    const nombresDesdeProductos = productos
      .map(p => {
        // Intentar en orden de preferencia
        return p.categoria_nombre || p.categoria || (p.categoria_id && categorias.find(c => String(c.id) === String(p.categoria_id))?.nombre);
      })
      .filter(nombre => nombre && String(nombre).trim() !== ''); // Filtrar valores vacíos o nulos

    const unicas = [...new Set(nombresDesdeProductos.map(nombre => String(nombre).trim()))];
    return ['Todas', ...unicas];
  }, [productos, categorias]); // Asegúrate de incluir 'categorias' aquí si usas el mapeo ID -> Nombre


  // === 2. Productos filtrados - CORREGIDO PARA MANEJAR LAS MISMAS PROPIEDADES ===
  const productosFiltrados = useMemo(() => {
    let filtered = [...productos];

    if (filtroCat !== 'Todas') {
      const filtroCatStr = String(filtroCat).trim();
      filtered = filtered.filter(p => {
        // Intentar encontrar la categoría del producto
        let nombreCategoria = p.categoria_nombre || p.categoria;

        // Si no se encontró directamente y se tiene categoria_id y el array categorias
        if (!nombreCategoria && p.categoria_id != null && Array.isArray(categorias) && categorias.length > 0) {
          const catObj = categorias.find(c => String(c.id).trim() === String(p.categoria_id).trim());
          if (catObj) {
            nombreCategoria = catObj.nombre; // Usar el nombre de la categoría encontrada
          }
        }

        // Comparar el nombre encontrado con el filtro
        return nombreCategoria && String(nombreCategoria).trim() === filtroCatStr;
      });
    }

    if (filtroTxt.trim()) {
      const term = filtroTxt.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const idStr = String(p.id ?? '');
        const nombreStr = String(p.nombre ?? '');
        // Intentar obtener la categoría para búsqueda
        let catStr = String(p.categoria_nombre || p.categoria || '');

        // Si no está directamente, intentar con el ID y el array de categorias
        if (catStr === 'undefined' || catStr === 'null' || catStr === '') {
            if (p.categoria_id != null && Array.isArray(categorias) && categorias.length > 0) {
                const catObj = categorias.find(c => String(c.id).trim() === String(p.categoria_id).trim());
                if (catObj) {
                    catStr = String(catObj.nombre);
                }
            }
        }

        return (
          idStr.toLowerCase().includes(term) ||
          nombreStr.toLowerCase().includes(term) ||
          catStr.toLowerCase().includes(term) ||
          String(p.categoria_id ?? '').toLowerCase().includes(term) // Opcional: buscar también por ID
        );
      });
    }

    return filtered;
  }, [productos, categorias, filtroCat, filtroTxt]); // Incluir categorias aquí también


  // === 3. Datos para la tabla — SIEMPRE TEXTO PLANO ===
  const tableData = useMemo(() => {
    return productosFiltrados.map(p => {
      let nombreCategoria = 'Sin Categoría';

      // Intentar obtener el nombre de la categoría, priorizando el nombre directo
      if (p.categoria_nombre != null) {
        nombreCategoria = String(p.categoria_nombre).trim();
      } else if (p.categoria != null) {
         nombreCategoria = String(p.categoria).trim();
      } else if (p.categoria_id != null && Array.isArray(categorias) && categorias.length > 0) {
        const cat = categorias.find(c =>
          String(c.id).trim() === String(p.categoria_id).trim()
        );
        nombreCategoria = cat ? String(cat.nombre).trim() : `ID ${p.categoria_id}`;
      }

      // Garantizar que sea un string válido
      if (!nombreCategoria || nombreCategoria === 'null' || nombreCategoria === 'undefined' || nombreCategoria === '') {
        nombreCategoria = 'Sin Categoría';
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