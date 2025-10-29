// src/components/Admin/ProvidersTab.jsx
import React, { useState, useMemo } from 'react';

const ProvidersTab = ({ proveedores }) => {
  const [filtroTexto, setFiltroTexto] = useState('');

  // Filtrar proveedores por nombre o email
  const proveedoresFiltrados = useMemo(() => {
    if (!filtroTexto.trim()) {
      return proveedores;
    }
    const term = filtroTexto.toLowerCase();
    return proveedores.filter(prov =>
      (prov.nombre && prov.nombre.toLowerCase().includes(term)) ||
      (prov.email && prov.email.toLowerCase().includes(term))
    );
  }, [proveedores, filtroTexto]);

  return (
    <>
      <h5>Proveedores</h5>
      
      {/* Barra de búsqueda */}
      <div className="mb-3">
        <input
          id="filtroProv"
          className="form-control"
          placeholder="Buscar proveedor por nombre o email..."
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
        />
      </div>

      {/* Lista de proveedores */}
      {proveedoresFiltrados.length === 0 ? (
        <div className="text-center text-muted mt-3">
          No se encontraron proveedores.
        </div>
      ) : (
        <ul id="lstProv" className="list-group">
          {proveedoresFiltrados.map((prov) => (
            <li key={prov.id} className="list-group-item">
              <strong>{prov.nombre}</strong> – {prov.email}
              {prov.telefono && <> – Tel: {prov.telefono}</>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default ProvidersTab;
