import {api} from '../../../api/client';

export const AuthApi = {
  login: async (email,password) =>{
    const response = await api.post('api/auth/login',{email,password});
    return response;
  },
  register: async (email,password,name)=>{
    const response = await api.post('api/auth/register',{email,password,name});
    return response;
  },
};