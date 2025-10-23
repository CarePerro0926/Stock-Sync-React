// src/components/Admin/DeleteTab.js
import React, { useState } from 'react';

const DeleteTab = ({ onDeleteProducto }) => {
  const [idToDelete, setIdToDelete] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!idToDelete.trim()) {
      alert('Ingresa un ID para eliminar.');
      return;
    }
    onDeleteProducto(idToDelete);
    setIdToDelete(''); // Limpiar input
    alert('Producto eliminado');
  };

  return (
    <>
      <h5>Eliminar Producto</h5>
      <form onSubmit={handleSubmit}>
        <div className="row g-2 mb-3">
          <div className="col-12 col-md">
            <input
              id="delId"
              className="form-control"
              placeholder="ID"
              value={idToDelete}
              onChange={(e) => setIdToDelete(e.target.value)}
            />
          </div>
          <div className="col-12 col-md">
            <button type="submit" id="btnDelProd" className="btn btn-danger w-100">Eliminar</button>
          </div>
        </div>
      </form>
    </>
  );
};

export default DeleteTab;