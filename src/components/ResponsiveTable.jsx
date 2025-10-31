// src/components/ResponsiveTable.jsx
import React from 'react';
import './ResponsiveTable.css';

const ResponsiveTable = ({ headers, data }) => {
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
          {data.map((row, i) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveTable;