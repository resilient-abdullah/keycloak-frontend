// src/api.js
const API_URL = 'http://localhost:8000/api';

export async function apiFetch(keycloak, url, options = {}) {
  const res = await fetch(API_URL + url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${keycloak.token}`,
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    keycloak.logout();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return res.status === 204 ? null : res.json();
}
