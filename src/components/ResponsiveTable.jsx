// src/components/ResponsiveTable.jsx
import React, { useState, useEffect } from 'react';
import './ResponsiveTable.css';

const ResponsiveTable = ({ headers, data }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Renderizado para móviles: tarjetas
  if (isMobile) {
    return (
      <div className="responsive-cards-container">
        {data.length === 0 ? (
          <p className="text-center text-muted">No hay datos disponibles.</p>
        ) : (
          data.map((row, index) => (
            <div key={index} className="card mb-3">
              <div className="card-body">
                {headers.map((header) => (
                  <div key={header.key} className="mb-1">
                    <strong>{header.label}:</strong> {row[header.key] ?? '—'}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // Renderizado para desktop: tabla
  return (
    <div className="responsive-table-container">
      <table className="responsive-table">
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h.key} style={{ textAlign: h.align || 'left' }}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center">
                No hay datos disponibles.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="table-row">
                {headers.map(h => (
                  <td
                    key={h.key}
                    data-label={h.label}
                    className="table-cell"
                    style={{ textAlign: h.align || 'left' }}
                  >
                    {row[h.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveTable;