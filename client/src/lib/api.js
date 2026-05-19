const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'No se pudo completar la solicitud.');
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  return response.blob();
}

export const api = {
  getActiveEvent: () => request('/api/events/active'),
  updateEvent: (token, data) => request('/api/events/active', { method: 'PATCH', token, body: JSON.stringify(data) }),
  resetEvent: (token) => request('/api/events/active/reset', { method: 'POST', token }),
  login: (credentials) => request('/api/auth/admin', { method: 'POST', body: JSON.stringify(credentials) }),
  getTodayKey: () => request('/api/auth/today-key'),
  checkIn: (employeeNumber) => request('/api/attendance/check-in', { method: 'POST', body: JSON.stringify({ employeeNumber }) }),
  stats: () => request('/api/attendance/stats'),
  importAttendees: (token, file, clearExisting) => {
    const body = new FormData();
    body.append('file', file);
    body.append('clearExisting', String(clearExisting));
    return request('/api/events/active/import', { method: 'POST', token, body });
  },
  templateUrl: () => `${API_BASE}/api/events/template`,
  exportReport: (token) => request('/api/events/active/export', { token }),
  drawPool: (pool) => request(`/api/draw/pool?pool=${pool}`),
  drawWinner: (token, payload) => request('/api/draw/winner', { method: 'POST', token, body: JSON.stringify(payload) }),
  drawHistory: (token) => request('/api/draw/history', { token })
};

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
