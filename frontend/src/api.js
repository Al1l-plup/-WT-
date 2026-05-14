const BASE = 'http://localhost:3001/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

async function del(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json();
}

async function patch(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  guns: {
    list: () => get('/guns'),
    create: (data) => post('/guns', data),
  },
  workers: {
    list: () => get('/workers'),
    create: (data) => post('/workers', data),
    deactivate: (id, data) => patch(`/workers/${id}/deactivate`, data),
  },
  transformers: {
    list: () => get('/transformers'),
    create: (data) => post('/transformers', data),
  },
  stations: {
    list: (brand_id) => get(brand_id ? `/stations?brand_id=${brand_id}` : '/stations'),
  },
  models: {
    list: (brand_id) => get(brand_id ? `/models?brand_id=${brand_id}` : '/models'),
  },
  brands: {
    list: () => get('/brands'),
  },
  spots: {
    list: (model_id) => get(model_id ? `/spots?model_id=${model_id}` : '/spots'),
    create: (data) => post('/spots', data),
    gunInfo: (spot_id) => get(`/spots/${spot_id}/gun-info`),
  },
  maintenance: {
    list: () => get('/maintenance'),
    create: (data) => post('/maintenance', data),
    delete: (id) => del(`/maintenance/${id}`),
  },
  defects: {
    list: () => get('/defects'),
    create: (data) => post('/defects', data),
    delete: (id) => del(`/defects/${id}`),
  },
  parameters: {
    list: () => get('/parameters'),
  },
};
