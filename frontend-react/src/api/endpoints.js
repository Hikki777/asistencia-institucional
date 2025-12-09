import client from './client';

export const institucionAPI = {
  init: (data) => client.post('/institucion/init', data),
  get: () => client.get('/institucion'),
};

export const alumnosAPI = {
  list: () => client.get('/alumnos'),
  get: (id) => client.get(`/alumnos/${id}`),
  create: (data) => client.post('/alumnos', data),
  update: (id, data) => client.put(`/alumnos/${id}`, data),
  delete: (id) => client.delete(`/alumnos/${id}`),
};

export const qrAPI = {
  generate: (data) => client.post('/qr/generar', data),
  list: () => client.get('/qr/listar/todos'),
  download: (id) => client.get(`/qr/${id}/png`, { responseType: 'blob' }),
};



export const healthAPI = {
  check: () => client.get('/health'),
};

export const authAPI = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  me: () => client.get('/auth/me'),
};

export const asistenciasAPI = {
  list: (params) => client.get('/asistencias', { params }),
  hoy: () => client.get('/asistencias/hoy'),
  stats: (dias = 7) => client.get(`/asistencias/stats?dias=${dias}`),
  create: (data) => client.post('/asistencias', data),
  delete: (id) => client.delete(`/asistencias/${id}`),
};

export const docentesAPI = {
  list: () => client.get('/docentes'),
  get: (id) => client.get(`/docentes/${id}`),
  create: (data) => client.post('/docentes', data),
  update: (id, data) => client.put(`/docentes/${id}`, data),
  delete: (id) => client.delete(`/docentes/${id}`),
};
