// src/data/initialData.js
import { v4 as uuidv4 } from 'uuid';

export const initialUsuarios = [
  { id: uuidv4(), username: 'admin', pass: 'admin', role: 'admin' },
  { id: uuidv4(), username: 'cliente', pass: 'cliente', role: 'cliente' }
];

export const initialProveedores = [
  { id: uuidv4(), nombre: 'NetZone', email: 'contacto@netzone.com' },
  { id: uuidv4(), nombre: 'CoolTech', email: 'ventas@cooltech.com' },
  { id: uuidv4(), nombre: 'DigitalStore', email: 'info@digitalstore.com' },
  { id: uuidv4(), nombre: 'PCMaster', email: 'soporte@pcmaster.com' },
  { id: uuidv4(), nombre: 'ElectroBits', email: 'ventas@electrobits.com' },
  { id: uuidv4(), nombre: 'GigaParts', email: 'giga@parts.com' },
  { id: uuidv4(), nombre: 'CompuWorld', email: 'ventas@compuworld.com' }
];

// Lista original de productos (sin ID, solo base de datos)
const productosOriginales = [
  { nombre: 'Procesador Intel Core i5-13400', cantidad: 12, precio: 1100000, categoria: 'Procesadores' },
  { nombre: 'Tarjeta Gráfica RTX 4060', cantidad: 15, precio: 1600000, categoria: 'Tarjetas Gráficas' },
  { nombre: 'Memoria RAM DDR5 16GB (3200MHz)', cantidad: 20, precio: 320000, categoria: 'Memorias RAM' },
  { nombre: 'SSD SATA 1TB', cantidad: 25, precio: 280000, categoria: 'Discos Duros' },
  { nombre: 'Placa Madre B660 Micro ATX', cantidad: 10, precio: 750000, categoria: 'Boards' },
  { nombre: 'Fuente de Poder 650W 80+ Bronze', cantidad: 18, precio: 250000, categoria: 'Fuentes de Poder' },
  { nombre: 'Gabinete Gamer con Ventiladores', cantidad: 22, precio: 350000, categoria: 'Gabinetes' },
  { nombre: 'Teclado Mecánico RGB', cantidad: 30, precio: 220000, categoria: 'Periféricos' },
  { nombre: 'Mouse Gaming Óptico', cantidad: 40, precio: 120000, categoria: 'Periféricos' },
  { nombre: 'Audífonos Gaming Inalámbricos', cantidad: 16, precio: 380000, categoria: 'Periféricos' },
  { nombre: 'Monitor LED 24" 144Hz', cantidad: 14, precio: 850000, categoria: 'Monitores' },
  { nombre: 'Cooler Air CPU Dual Tower', cantidad: 18, precio: 180000, categoria: 'Refrigeración' },
  { nombre: 'Router Wi-Fi 6', cantidad: 18, precio: 320000, categoria: 'Redes' },
  { nombre: 'Switch Ethernet 8 Puertos', cantidad: 12, precio: 180000, categoria: 'Redes' },
  { nombre: 'Disipador Líquido RGB', cantidad: 8, precio: 350000, categoria: 'Refrigeración' },
  { nombre: 'Kit de Ventiladores ARGB', cantidad: 20, precio: 120000, categoria: 'Refrigeración' },
  { nombre: 'SSD NVMe 1TB', cantidad: 22, precio: 480000, categoria: 'Discos Duros' },
  { nombre: 'Memoria RAM DDR5 16GB', cantidad: 16, precio: 320000, categoria: 'Memorias RAM' },
  { nombre: 'Procesador AMD Ryzen 7', cantidad: 10, precio: 1100000, categoria: 'Procesadores' },
  { nombre: 'Placa Madre Micro ATX', cantidad: 14, precio: 580000, categoria: 'Boards' },
  { nombre: 'Fuente Modular 750W', cantidad: 10, precio: 300000, categoria: 'Fuentes de Poder' },
  { nombre: 'Tarjeta Gráfica RTX 3060', cantidad: 6, precio: 1800000, categoria: 'Tarjetas Gráficas' },
  { nombre: 'Monitor Curvo 27 pulgadas', cantidad: 12, precio: 950000, categoria: 'Monitores' },
  { nombre: 'Combo Teclado y Mouse Inalámbrico', cantidad: 25, precio: 180000, categoria: 'Periféricos' },
  { nombre: 'Hub USB 3.0', cantidad: 30, precio: 60000, categoria: 'Periféricos' },
  { nombre: 'Soporte para Monitor', cantidad: 15, precio: 85000, categoria: 'Accesorios' },
  { nombre: 'Cable HDMI 2.1', cantidad: 50, precio: 40000, categoria: 'Accesorios' },
  { nombre: 'Micrófono Condensador USB', cantidad: 18, precio: 220000, categoria: 'Periféricos' },
  { nombre: 'Silla Ergonómica Gamer', cantidad: 10, precio: 750000, categoria: 'Mobiliario' },
  { nombre: 'Alfombrilla RGB XL', cantidad: 40, precio: 90000, categoria: 'Accesorios' }
];

// Extraer categorías únicas
const nombresCategorias = [...new Set(productosOriginales.map(p => p.categoria))];

// Crear lista de categorías con UUID
export const initialCategorias = nombresCategorias.map((nombre) => ({
  id: uuidv4(),
  nombre
}));

// Crear mapa nombre id
const categoriaMap = {};
initialCategorias.forEach(cat => {
  categoriaMap[cat.nombre] = cat.id;
});

// Crear productos con UUID y categoría_id válida
export const initialProductos = productosOriginales.map(p => ({
  id: uuidv4(),
  nombre: p.nombre,
  cantidad: p.cantidad,
  precio: p.precio,
  categoria_id: categoriaMap[p.categoria] || null,
  categoria_nombre: p.categoria || 'Sin Categoría'
}));

// Filtro auxiliar
export const filtrarProductosPorCategoria = (categoria) => {
  if (!categoria || categoria === 'Todas') {
    return initialProductos;
  }
  return initialProductos.filter(producto => producto.categoria_nombre === categoria);
};
