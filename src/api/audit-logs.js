// src/api/audit-logs.js
const base = 'https://stock-sync-api.onrender.com';

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

  const url = `${base}/api/audit-logs?${params.toString()}`;

  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    // intentar parsear JSON, si no, leer texto
    let body;
    try { body = await res.json(); } catch { body = await res.text(); }
    // lanzar Error con mensaje consistente
    const message = body?.message || body?.error || String(body) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return res.json(); // { items: [...], meta: { total } }
}
