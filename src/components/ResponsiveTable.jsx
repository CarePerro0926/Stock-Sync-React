// src/components/ResponsiveTable.jsx
import React from 'react';

const ResponsiveTable = ({ headers, data, maxHeight = 'auto' }) => {
  return (
    <div className="table-responsive responsive-table" style={{ maxHeight, overflow: 'auto' }}>
      <table className="table table-bordered table-sm mb-0">
        <thead className="table-light">
          <tr>
            {headers.map(header => (
              <th key={header.key} style={header.align ? { textAlign: header.align } : {}}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center">No se encontraron productos.</td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="table-row">
                {headers.map(header => (
                  <td
                    key={`${rowIndex}-${header.key}`}
                    className={`table-cell ${header.key === 'cantidadInput' ? 'qty-input-container' : ''}`}
                    data-title={header.label}
                    style={header.align ? { textAlign: header.align } : {}}
                  >
                    {/* 👇 FORZAR QUE SIEMPRE MUESTRE ALGO */}
                    {row[header.key] != null && row[header.key] !== '' 
                      ? row[header.key] 
                      : '—'}
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