import api from '../api/axios';

export const authService = {
    // Admin Login
    adminLogin: async (credentials) => {
        const response = await api.post('/users/login', credentials);
        return response.data;
    },

    // Customer Login
    customerLogin: async (credentials) => {
        const response = await api.post('/frontend/account_login', credentials);
        return response.data;
    },

    // Get Profile (Admin/Vigilance)
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    // Update Profile
    updateProfile: async (data) => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },

    // Change Password
    changePassword: async (data) => {
        const response = await api.put('/users/change-password', data);
        return response.data;
    }
};