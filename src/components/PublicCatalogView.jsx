// src/components/PublicCatalogView.jsx
import React, { useState, useEffect } from 'react';
import ResponsiveTable from './ResponsiveTable'; // Componente reutilizable para la tabla

const PublicCatalogView = ({ productos, categorias, onBack }) => {
  const [filtroCat, setFiltroCat] = useState('Todas');
  const [filtroTxt, setFiltroTxt] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  // Actualizar lista de categorías en el filtro si cambian las categorías
  useEffect(() => {
    const cats = ['Todas', ...categorias.map(c => c.nombre)];
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
  }, [productos, categorias, filtroCat, filtroTxt]); // Asegúrate de incluir 'categorias'

  // Definir las columnas para la tabla responsive
  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoriaNombre', label: 'Categoria' }, // <-- Mostrar NOMBRE, no ID
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' }
  ];

  // Mapear los productos filtrados a filas de la tabla, convirtiendo categoria_id a nombre
  const tableData = productosFiltrados.map(p => {
    // Buscar el nombre de la categoría
    const categoriaObj = categorias.find(cat => cat.id === p.categoria_id);
    const nombreCategoria = categoriaObj ? categoriaObj.nombre : 'Categoría Desconocida'; // Manejar caso no encontrado

    return {
      id: p.id,
      nombre: p.nombre,
      categoriaNombre: nombreCategoria, // <-- Usar el nombre encontrado
      cantidad: p.cantidad,
      precio: p.precio.toLocaleString('es-CO')
    };
  });

  const listaCategoriasFiltro = ['Todas', ...categorias.map(c => c.nombre)]; // Lista de NOMBRES para el select

  return (
    <div className="card p-4">
      <h4 className="text-stock">Inventario Disponible</h4>
      <div className="row g-2 mb-3">
        <div className="col">
          <select
            id="filtroCatPublic"
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
            id="filtroTxtPublic"
            className="form-control"
            placeholder="Buscar..."
            value={filtroTxt}
            onChange={(e) => setFiltroTxt(e.target.value)} // <-- Actualiza estado filtro
          />
        </div>
      </div>
      {/* Usar el componente ResponsiveTable para mostrar los datos */}
      <ResponsiveTable
        headers={tableHeaders}
        data={tableData}
        maxHeight="300px" // Ajustar altura según sea necesario
      />
      <div className="text-end mt-3">
        <button
          id="btnBackToLogin"
          className="btn btn-outline-secondary"
          onClick={onBack} // Llamar a la función pasada como prop para regresar
        >
          Regresar
        </button>
      </div>
    </div>
  );
};

export default PublicCatalogView;