// src/api/audit-logs.js
export async function obtenerAuditLogs({ usuario, accion, desde, hasta, limit = 25, offset = 0 } = {}, token) {
  const params = new URLSearchParams();
  if (usuario) params.append('usuario', usuario);
  if (accion) params.append('accion', accion);
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  params.append('limit', String(limit));
  params.append('offset', String(offset));

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Si tu backend corre en otro puerto en desarrollo, pon aquí la base, por ejemplo:
  // const base = 'http://localhost:3000';
  const base = ''; // '' = misma origin
  const url = `${base}/api/audit-logs?${params.toString()}`;

  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    let err;
    try { err = await res.json(); } catch { err = { error: await res.text() }; }
    throw err;
  }
  return res.json(); // { items: [...], meta: { total } }
}
