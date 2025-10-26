// src/components/Admin/UpdateTab.jsx
import React, { useState } from 'react';

const UpdateTab = ({ productos, onUpdateProducto, categorias }) => {
  const [idProducto, setIdProducto] = useState('');
  const [producto, setProducto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    cantidad: '',
    categoria: ''
  });

  // ✅ Normalizar categorías: siempre devuelve un array de strings
  const getListaCategorias = () => {
    if (!categorias || !Array.isArray(categorias)) return [];
    
    return categorias.map(cat => {
      if (typeof cat === 'string') return cat;
      if (typeof cat === 'object' && cat.nombre) return cat.nombre;
      return String(cat); // fallback
    });
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    if (!idProducto.trim()) {
      alert('Ingresa un ID de producto.');
      return;
    }

    const prod = productos.find(p => p.id === idProducto.trim());
    if (!prod) {
      alert('Producto no encontrado.');
      setProducto(null);
      setFormData({ nombre: '', precio: '', cantidad: '', categoria: '' });
      return;
    }

    setProducto(prod);
    setFormData({
      nombre: prod.nombre,
      precio: prod.precio,
      cantidad: prod.cantidad,
      categoria: prod.categoria
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!producto) {
      alert('Primero busca un producto válido.');
      return;
    }

    const precio = parseFloat(formData.precio);
    const cantidad = parseInt(formData.cantidad, 10);

    if (isNaN(precio) || precio < 0) {
      alert('Precio inválido.');
      return;
    }
    if (isNaN(cantidad) || cantidad < 0) {
      alert('Cantidad inválida.');
      return;
    }

    const productoActualizado = {
      id: producto.id,
      nombre: formData.nombre.trim(),
      precio: precio,
      cantidad: cantidad,
      categoria: formData.categoria
    };

    onUpdateProducto(productoActualizado);
    alert('Producto actualizado con éxito');
    setIdProducto('');
    setProducto(null);
    setFormData({ nombre: '', precio: '', cantidad: '', categoria: '' });
  };

  // Usa la función segura
  const listaCategorias = getListaCategorias();

  return (
    <>
      <h5>Actualizar Producto</h5>
      <form onSubmit={handleBuscar} className="mb-4">
        <div className="row g-2">
          <div className="col-12 col-md-8">
            <input
              id="updId"
              className="form-control"
              placeholder="ID del producto"
              value={idProducto}
              onChange={(e) => setIdProducto(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-4">
            <button type="submit" id="btnBuscarProd" className="btn btn-outline-primary w-100">Buscar</button>
          </div>
        </div>
      </form>

      {producto && (
        <form onSubmit={handleSubmit}>
          <div className="row g-2 mb-3">
            <div className="col-12">
              <label className="form-label">Nombre</label>
              <input
                name="nombre"
                className="form-control"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Precio</label>
              <input
                name="precio"
                type="number"
                step="0.01"
                className="form-control"
                value={formData.precio}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Stock (Cantidad)</label>
              <input
                name="cantidad"
                type="number"
                className="form-control"
                value={formData.cantidad}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Categoría</label>
              <select
                name="categoria"
                className="form-select"
                value={formData.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una categoría</option>
                {listaCategorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" id="btnUpdateProd" className="btn btn-success w-100">Actualizar Producto</button>
        </form>
      )}
    </>
  );
};

export default UpdateTab;