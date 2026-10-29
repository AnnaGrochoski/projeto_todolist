const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3333';

async function request(path, { method = 'GET', body } = {}) {
  // Content-Type só é enviado quando há corpo (evita erro do Fastify em DELETE vazio)
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Erro ao comunicar com o servidor.');
  return data;
}

export const api = {
  list: (search, status = 'all') =>
    request(`/api/tasks?search=${encodeURIComponent(search)}&status=${status}`),
  create: (title, dueDate) => request('/api/tasks', { method: 'POST', body: { title, dueDate } }),
  update: (id, patch) => request(`/api/tasks/${id}`, { method: 'PATCH', body: patch }),
  remove: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};
