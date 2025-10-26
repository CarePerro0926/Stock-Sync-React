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
    const txt = filtroTxt.toLowerCase().trim();
    const filtered = productos.filter(p =>
      (filtroCat === 'Todas' || p.categoria === filtroCat) &&
      (p.id.includes(txt) || p.nombre.toLowerCase().includes(txt))
    );
    setProductosFiltrados(filtered);
  }, [productos, filtroCat, filtroTxt]);

  // Definir las columnas para la tabla responsive
  const tableHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'cantidad', label: 'Stock', align: 'center' },
    { key: 'precio', label: 'Precio Unidad', align: 'right' }
  ];

  // Mapear los productos filtrados a filas de la tabla
  const tableData = productosFiltrados.map(p => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    cantidad: p.cantidad,
    precio: p.precio.toLocaleString('es-CO')
  }));

  return (
    <div className="card p-4">
      <h4 className="text-stock">Inventario Disponible</h4>
      <div className="row g-2 mb-3">
        <div className="col">
          <select
            id="filtroCatPublic"
            className="form-select"
            value={filtroCat}
            onChange={(e) => setFiltroCat(e.target.value)}
          >
            {/* Mapear categorías dinámicamente */}
            {['Todas', ...categorias.map(c => c.nombre)].map(cat => (
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
            onChange={(e) => setFiltroTxt(e.target.value)}
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