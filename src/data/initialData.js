// src/data/initialData.js
export const initialUsuarios = [
  { user: 'admin', pass: 'admin', role: 'admin' },
  { user: 'cliente', pass: 'cliente', role: 'cliente' }
];

export const initialProductos = [
  { id: '1',  nombre: 'Procesador Intel Core i5-13400',    cantidad: 12, precio: 1100000, categoria: 'Procesadores' },
  { id: '2',  nombre: 'Tarjeta Gráfica RTX 4060',          cantidad: 15, precio: 1600000, categoria: 'Tarjetas Gráficas' },
  { id: '3',  nombre: 'Memoria RAM DDR5 16GB (3200MHz)',   cantidad: 20, precio: 320000,  categoria: 'Memorias RAM' },
  { id: '4',  nombre: 'SSD SATA 1TB',                      cantidad: 25, precio: 280000,  categoria: 'Discos Duros' },
  { id: '5',  nombre: 'Placa Madre B660 Micro ATX',        cantidad: 10, precio: 750000,  categoria: 'Boards' },
  { id: '6',  nombre: 'Fuente de Poder 650W 80+ Bronze',   cantidad: 18, precio: 250000,  categoria: 'Fuentes de Poder' },
  { id: '7',  nombre: 'Gabinete Gamer con Ventiladores',   cantidad: 22, precio: 350000,  categoria: 'Gabinetes' },
  { id: '8',  nombre: 'Teclado Mecánico RGB',              cantidad: 30, precio: 220000,  categoria: 'Periféricos' },
  { id: '9',  nombre: 'Mouse Gaming Óptico',               cantidad: 40, precio: 120000,  categoria: 'Periféricos' },
  { id: '10', nombre: 'Audífonos Gaming Inalámbricos',     cantidad: 16, precio: 380000,  categoria: 'Periféricos' },
  { id: '11', nombre: 'Monitor LED 24" 144Hz',             cantidad: 14, precio: 850000,  categoria: 'Monitores' },
  { id: '12', nombre: 'Cooler Air CPU Dual Tower',         cantidad: 18, precio: 180000,  categoria: 'Refrigeración' },
  { id: '13', nombre: 'Router Wi-Fi 6',                    cantidad: 18, precio: 320000,  categoria: 'Redes' },
  { id: '14', nombre: 'Switch Ethernet 8 Puertos',         cantidad: 12, precio: 180000,  categoria: 'Redes' },
  { id: '15', nombre: 'Disipador Líquido RGB',             cantidad: 8,  precio: 350000,  categoria: 'Refrigeración' },
  { id: '16', nombre: 'Kit de Ventiladores ARGB',          cantidad: 20, precio: 120000,  categoria: 'Refrigeración' },
  { id: '17', nombre: 'SSD NVMe 1TB',                      cantidad: 22, precio: 480000,  categoria: 'Discos Duros' },
  { id: '18', nombre: 'Memoria RAM DDR5 16GB',             cantidad: 16, precio: 320000,  categoria: 'Memorias RAM' },
  { id: '19', nombre: 'Procesador AMD Ryzen 7',            cantidad: 10, precio: 1100000, categoria: 'Procesadores' },
  { id: '20', nombre: 'Placa Madre Micro ATX',             cantidad: 14, precio: 580000,  categoria: 'Boards' },
  { id: '21', nombre: 'Fuente Modular 750W',               cantidad: 10, precio: 300000,  categoria: 'Fuentes de Poder' },
  { id: '22', nombre: 'Tarjeta Gráfica RTX 3060',          cantidad: 6,  precio: 1800000, categoria: 'Tarjetas Gráficas' },
  { id: '23', nombre: 'Monitor Curvo 27 pulgadas',         cantidad: 12, precio: 950000,  categoria: 'Monitores' },
  { id: '24', nombre: 'Combo Teclado y Mouse Inalámbrico', cantidad: 25, precio: 180000,  categoria: 'Periféricos' },
  { id: '25', nombre: 'Hub USB 3.0',                       cantidad: 30, precio: 60000,   categoria: 'Periféricos' },
  { id: '26', nombre: 'Soporte para Monitor',              cantidad: 15, precio: 85000,   categoria: 'Accesorios' },
  { id: '27', nombre: 'Cable HDMI 2.1',                    cantidad: 50, precio: 40000,   categoria: 'Accesorios' },
  { id: '28', nombre: 'Micrófono Condensador USB',         cantidad: 18, precio: 220000,  categoria: 'Periféricos' },
  { id: '29', nombre: 'Silla Ergonómica Gamer',            cantidad: 10, precio: 750000,  categoria: 'Mobiliario' },
  { id: '30', nombre: 'Alfombrilla RGB XL',                cantidad: 40, precio: 90000,   categoria: 'Accesorios' }
];

export const initialProveedores = [
  { nombre: 'NetZone',       email: 'contacto@netzone.com' },
  { nombre: 'CoolTech',      email: 'ventas@cooltech.com' },
  { nombre: 'DigitalStore',  email: 'info@digitalstore.com' },
  { nombre: 'PCMaster',      email: 'soporte@pcmaster.com' },
  { nombre: 'ElectroBits',   email: 'ventas@electrobits.com' },
  { nombre: 'GigaParts',     email: 'giga@parts.com' },
  { nombre: 'CompuWorld',    email: 'ventas@compuworld.com' }
];
