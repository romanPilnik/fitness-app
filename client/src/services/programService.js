import { api } from '../api/client.js';

export const programService = {
  async getAll() {
    const response = await api.get('/api/v1/programs');
    return response.data.docs;
  },
  async getById(programId) {
    const response = await api.get(`/api/v1/programs/${programId}`);
    return response.data;
  },
  async createFromTemplate(templateId, startDate, customizations) {
    // add error handling
    const response = await api.post('/api/v1/programs/from-template', {
      templateId,
      startDate,
      customizations,
    });
    return response.data;
  },
};
