// src/components/ResponsiveTable.jsx
import React from 'react';
import './ResponsiveTable.css';

const ResponsiveTable = ({ headers, data }) => {
  // Estilos de emergencia para forzar la visibilidad en el modo móvil
  const forcedHeaderStyle = { 
    display: 'table-header-group',
    visibility: 'visible'
  };
  const forcedRowStyle = { 
    display: 'table-row'
  };
  const forcedCellStyle = { 
    display: 'table-cell'
  };

  return (
    <div className="responsive-table-container">
      <table className="responsive-table">
        <thead style={forcedHeaderStyle}> {/* ⬅️ APLICAR ESTILOS AQUÍ */}
          <tr style={forcedRowStyle}> {/* ⬅️ Y AQUÍ */}
            {headers.map(h => (
              <th 
                key={h.key} 
                style={{ 
                  textAlign: h.align || 'left', 
                  ...forcedCellStyle // ⬅️ Y AQUÍ
                }}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* ... el resto de tu código del cuerpo de la tabla se mantiene ... */}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveTable;