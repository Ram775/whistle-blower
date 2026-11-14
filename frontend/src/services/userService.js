import api from '../api/axios';

export const userService = {
    // Admin
    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    createUser: async (data) => {
        const response = await api.post('/users', data);
        return response.data;
    },
    getUserById: async (id) => {
        const response = await api.get(`/users/${id}/edit`);
        return response.data;
    },
    updateUser: async (id, data) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },
    changeUserStatus: async (id, status) => {
        const response = await api.post('/users/change_status', { status_id: id, status });
        return response.data;
    },

    // Dashboard stats
    getDashboardStats: async () => {
        const response = await api.get('/users/dashboard');
        return response.data;
    }
};