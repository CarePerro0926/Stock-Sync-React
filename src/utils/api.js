// src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL;
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN;

// Obtener productos (lista)
export async function fetchProductos() {
  const res = await fetch(`${API_URL}/api/productos`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Error ${res.status} al obtener productos`);
  return res.json();
}

// Deshabilitar producto (admin)
export async function disableProducto(id) {
  const res = await fetch(`${API_URL}/api/productos/${id}/disable`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_TOKEN
    }
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, payload };
  return payload;
}

// Habilitar producto (admin)
export async function enableProducto(id) {
  const res = await fetch(`${API_URL}/api/productos/${id}/enable`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_TOKEN
    }
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, payload };
  return payload;
}

// Login (si quieres centralizarlo también)
export async function login({ identifier, password }) {
  const id = identifier.trim();
  const payload = id.includes('@')
    ? { email: id, password: password.trim() }
    : { username: id, password: password.trim() };

  const res = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  if (!res.ok) throw { status: res.status, payload: result };
  return result;
}