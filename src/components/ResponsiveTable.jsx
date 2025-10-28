// src/components/ResponsiveTable.jsx
import React from 'react';

const ResponsiveTable = ({ headers, data }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-sm table-bordered">
        <thead className="table-light">
          <tr>
            {headers.map(h => (
              <th key={h.key} style={{ textAlign: h.align || 'left', whiteSpace: 'nowrap' }}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {headers.map(h => (
                <td
                  key={h.key}
                  style={{
                    textAlign: h.align || 'left',
                    whiteSpace: 'nowrap',
                    verticalAlign: 'middle'
                  }}
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