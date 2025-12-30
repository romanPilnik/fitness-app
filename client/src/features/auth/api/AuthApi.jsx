import { api } from '../../../api/client';

export const AuthApi = {
  login: async (email, password) => {
    const response = await api.post('api/auth/login', { email, password });
    return response.data;
  },
  register: async (email, password, name) => {
    const response = await api.post('api/auth/register', { email, password, name });
    return response.data;
  },
  currentUser: async () => {
    const response = await api.get('api/users/me');
    return response.data;
  },
};
