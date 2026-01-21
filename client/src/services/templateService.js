import { api } from '../api/client.js';
import { programTemplatesMock } from '../mocks/programTemplates.mock.js';
/** @type {import('../api/types').Exercise[]} */

const USE_MOCK = import.meta.env.VITE_USE_MOCKS === 'true';

export const templateService = {
  async getAll(filters = {}) {
    if (USE_MOCK) {
      return programTemplatesMock.data.docs;
    }
    const response = await api.get('/api/v1/programs/templates', { params: filters });
    return response.data.docs;
  },
  async getById(id) {
    if (USE_MOCK) {
      const found = programTemplatesMock.data.docs.find((template) => template._id === id);
      if (!found) throw new Error('Template not found');
      return found;
    }
    const response = await api.get(`/api/v1/programs/templates/${id}`);
    return response.data;
  },
};
