// src/components/ResponsiveTable.jsx
import React from 'react';

const ResponsiveTable = ({ headers, data, maxHeight = 'auto' }) => {
  return (
    <div className="table-responsive" style={{ maxHeight, overflowY: 'auto' }}>
      <table className="table table-striped">
        <thead className="table-light">
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
            <tr key={i}>
              {headers.map(h => (
                <td key={h.key} style={{ textAlign: h.align || 'left' }}>
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