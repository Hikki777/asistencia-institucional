import client from './client';

export const excusasAPI = {
  create: (data) => client.post('/excusas', data),
  list: (params) => client.get('/excusas', { params }),
};
