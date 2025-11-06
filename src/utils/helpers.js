// src/utils/helpers.js

export function filtroProductos(lista, { categoria = '', texto = '' } = {}) {
  const txt = texto.toLowerCase().trim();
  const cat = categoria.trim().toLowerCase();

  return lista.filter(p => {
    const nombre = String(p.nombre ?? '').toLowerCase();
    const id = String(p.id ?? '').toLowerCase();
    const catNombre = String(p.categoria_nombre ?? p.categoria ?? '').toLowerCase();

    const coincideCategoria = !cat || cat === 'todas' || catNombre === cat;
    const coincideTexto = !txt || nombre.includes(txt) || id.includes(txt) || catNombre.includes(txt);

    return coincideCategoria && coincideTexto;
  });
}