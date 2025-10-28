import React from 'react';

const ResponsiveTable = ({ headers, data, maxHeight = 'auto' }) => {
  return (
    <div
      className="table-responsive"
      style={{
        maxHeight,
        overflowY: 'auto',
        overflowX: 'auto' // ← permite scroll horizontal solo si es necesario
      }}
    >
      <table className="table table-striped table-sm table-bordered">
        <thead className="table-light">
          <tr>
            {headers.map(h => (
              <th
                key={h.key}
                style={{
                  textAlign: h.align || 'left',
                  whiteSpace: 'nowrap' // ← evita que el texto se rompa en móviles
                }}
              >
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
                    whiteSpace: 'nowrap', // ← mantiene la celda compacta
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