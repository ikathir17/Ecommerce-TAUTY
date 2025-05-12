import axios from 'axios';
import { config } from './config';

export const authService = {
    async login(email, password) {
        const response = await axios.post(config.endpoints.auth.login, {
            email,
            password,
        });
        return response.data;
    },

    async register(name, email, password) {
        const response = await axios.post(config.endpoints.auth.register, {
            name,
            email,
            password,
        });
        return response.data;
    },

    async getCurrentUser() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const response = await axios.get(config.endpoints.auth.me, {
                headers: config.getAuthHeader(),
            });
            return response.data;
        } catch (error) {
            localStorage.removeItem('token');
            return null;
        }
    },
};
