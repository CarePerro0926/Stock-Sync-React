// src/components/Admin/InventoryTab.jsx
import React, { useState, useEffect } from 'react';
import ResponsiveTable from '../ResponsiveTable'; // Asumiendo componente reutilizable

const InventoryTab = ({ productos, categorias, onDeleteProducto }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  // Actualizar lista de categorías en el filtro si cambian las categorías
  useEffect(() => {
    const cats = [...new Set(productos.map(p => p.categoria))];
    if (!cats.includes(filtroCat)) setFiltroCat('Todas');
  }, [categorias, filtroCat]);

  // Aplicar filtros cuando cambian productos, filtro de categoría o texto
  useEffect(() => {
    let filtered = productos;

    if (filtroCat !== 'Todas') {
      // Busca el ID de la categoría por nombre
      const categoriaSeleccionada = categorias.find(cat => cat.nombre === filtroCat);
      if (categoriaSeleccionada) {
         filtered = filtered.filter(p => p.categoria_id === categoriaSeleccionada.id);
      } else {
         filtered = []; // Si no se encuentra la categoría por nombre, no hay resultados
      }
    }

    if (filtroTxt) {
      const txtLower = filtroTxt.toLowerCase();
      filtered = filtered.filter(p =>
        p.id.includes(txtLower) ||
        p.nombre.toLowerCase().includes(txtLower)
      );
    }

    setProductosFiltrados(filtered);
  }, [productos, categorias, filtroCat, filtroTxt]);

  // Preparar datos para la tabla, mapeando categoria_id a nombre
  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoriaNombre', label: 'Categoria' }, // <-- Mostrar NOMBRE, no ID
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' },
    { key: 'acciones', label: 'Acciones', align: 'center' } // Columna para botones de acción
  ];

  const tableData = productosFiltrados.map(p => {
    // Buscar el nombre de la categoría
    let nombreCategoria = 'Sin Categoría'; // Valor por defecto
    if (p.categoria_id) { // Verificar que tenga categoria_id
      const categoriaObj = categorias.find(cat => cat.id === p.categoria_id);
      if (categoriaObj) {
        nombreCategoria = categoriaObj.nombre;
      } else {
        // Si no se encuentra, usar el ID como fallback (para depuración)
        nombreCategoria = `ID: ${p.categoria_id}`;
      }
    } else {
      // Si no tiene categoria_id, intentar usar otra propiedad
      if (p.categoria_nombre) {
        nombreCategoria = p.categoria_nombre;
      } else if (p.categoria) {
        nombreCategoria = p.categoria;
      }
    }

    return {
      id: p.id,
      nombre: p.nombre,
      categoriaNombre: nombreCategoria, // <-- Usar el nombre encontrado o el valor por defecto
      cantidad: p.cantidad,
      precio: p.precio.toLocaleString('es-CO'),
      acciones: (
        <button
          className="btn btn-sm btn-danger"
          onClick={() => onDeleteProducto(p.id)}
        >
          Eliminar
        </button>
      )
    };
  });

  const listaCategoriasFiltro = ['Todas', ...categorias.map(c => c.nombre)]; // Lista de NOMBRES para el select

  return (
    <div>
      <h5>Inventario</h5>
      <div className="row g-2 mb-3">
        <div className="col">
          <select
            id="filtroCatAdmin"
            className="form-select"
            value={filtroCat}
            onChange={(e) => setFiltroCat(e.target.value)} // <-- Actualiza estado filtro
          >
            {listaCategoriasFiltro.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col">
          <input
            id="filtroTxtAdmin"
            className="form-control"
            placeholder="Buscar..."
            value={filtroTxt}
            onChange={(e) => setFiltroTxt(e.target.value)} // <-- Actualiza estado filtro
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