// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL;

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