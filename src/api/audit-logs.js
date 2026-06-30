// src/api/audit-logs.js
const BASE = ''; // llamada relativa al mismo dominio

export async function obtenerAuditLogs({ usuario, accion, desde, hasta, limit = 10, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (usuario) params.append('usuario', usuario);
  if (accion) params.append('accion', accion);
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  params.append('limit', String(limit));
  params.append('offset', String(offset));

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || localStorage.getItem('token') : null;

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${BASE}/api/proxy-audit-logs?${params.toString()}`;

  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    let body;
    try { body = await res.json(); } catch { body = await res.text(); }
    const message = body?.message || body?.error || String(body) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}
