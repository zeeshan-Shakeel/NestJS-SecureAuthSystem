import api from '@/lib/axios';
import { RegisterValues, LoginValues } from '@/lib/schemas';

export const authService = {
    register: async (data: RegisterValues) => {
        return api.post('/auth/register', data);
    },

    login: async (data: LoginValues) => {
        return api.post('/auth/signIn', data);
    },

    logout: async () => {
        return api.post('/auth/logout');
    },

    getProfile: async () => {
        return api.get('/auth/profile');
    },
};
