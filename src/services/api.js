// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || '';

// Registro de usuario
export async function registrarUsuario(data) {
  const res = await fetch(`${API_BASE}/api/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw await res.json();
  return res.json();
}

// Login de usuario
export async function loginUsuario(data) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw await res.json();
  return res.json();
}

// Obtener todos los usuarios
export async function obtenerUsuarios(token) {
  const res = await fetch(`${API_BASE}/api/usuarios`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw await res.json();
  return res.json();
}

// Obtener usuario por ID
export async function obtenerUsuarioPorId(id, token) {
  const res = await fetch(`${API_BASE}/api/usuarios/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw await res.json();
  return res.json();
}

// Actualizar usuario por ID
export async function actualizarUsuario(id, data, token) {
  const res = await fetch(`${API_BASE}/api/usuarios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw await res.json();
  return res.json();
}

// Eliminar usuario por ID
export async function eliminarUsuario(id, token) {
  const res = await fetch(`${API_BASE}/api/usuarios/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw await res.json();
  return { mensaje: 'Usuario eliminado' };
}

// Obtener registros de auditoría; filtra por usuario, acción, rango de fechas y soporta paginación
export async function obtenerAuditLogs(
  { usuario, accion, desde, hasta, limit = 10, offset = 0 } = {},
  token
) {
  const params = new URLSearchParams();
  if (usuario) params.append('usuario', usuario);
  if (accion) params.append('accion', accion);
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  params.append('limit', String(limit));
  params.append('offset', String(offset));

  // Preferir token pasado; si no, intentar desde localStorage (cliente)
  let authToken = token;
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('authToken') || localStorage.getItem('token') || null;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  // Llamada RELATIVA al proxy serverless interno para no exponer claves
  const url = `/api/proxy-audit-logs?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers
  });

  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    const message = body?.message || body?.error || String(body) || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return res.json(); // { items: [...], meta: { total } }
}
