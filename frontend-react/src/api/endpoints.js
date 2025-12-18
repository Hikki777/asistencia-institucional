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

export const reportesAPI = {
  pdf: (filtros) => client.post('/reportes/pdf', filtros, { responseType: 'blob' }),
  excel: (filtros) => client.post('/reportes/excel', filtros, { responseType: 'blob' }),
  alumno: {
    pdf: (id) => client.get(`/reportes/alumno/${id}/pdf`, { responseType: 'blob' }),
    excel: (id) => client.get(`/reportes/alumno/${id}/excel`, { responseType: 'blob' })
  }
};

export const metricsAPI = {
  get: () => client.get('/metrics'),
  reset: () => client.post('/metrics/reset')
};

export const usuariosAPI = {
  list: () => client.get('/usuarios'),
  create: (data) => client.post('/usuarios', data),
  delete: (id) => client.delete(`/usuarios/${id}`)
};

export const excusasAPI = {
  list: (params) => client.get('/excusas', { params }),
  create: (data) => client.post('/excusas', data),
  update: (id, data) => client.put(`/excusas/${id}`, data),
  delete: (id) => client.delete(`/excusas/${id}`)
};

export const dashboardAPI = {
  stats: () => client.get('/dashboard/stats'),
  topGrados: () => client.get('/dashboard/top-grados')
};
