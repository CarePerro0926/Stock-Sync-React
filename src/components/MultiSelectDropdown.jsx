// src/components/MultiSelectDropdown.jsx
import React, { useState } from 'react';

export default function MultiSelectDropdown({ label, options = [], selected = [], onChange }) {
  const [open, setOpen] = useState(false);

  const toggleOption = (value) => {
    const exists = selected.includes(value);
    const updated = exists
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(updated);
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="dropdown">
        <button
          className="form-control text-start"
          type="button"
          onClick={() => setOpen(!open)}
        >
          {selected.length > 0 ? selected.join(', ') : 'Selecciona...'}
        </button>
        {open && (
          <div className="dropdown-menu show w-100 p-2 border">
            {options.map(opt => (
              <div key={opt} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggleOption(opt)}
                  id={`chk-${opt}`}
                />
                <label className="form-check-label" htmlFor={`chk-${opt}`}>
                  {opt}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}