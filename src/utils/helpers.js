// src/utils/helpers.js
export const filtroProductos = (lista, txt, cat) => {
  txt = txt.toLowerCase().trim();
  return lista.filter(p =>
    (cat==='Todas'||p.categoria===cat) &&
    (p.id.includes(txt)||p.nombre.toLowerCase().includes(txt))
  );
};