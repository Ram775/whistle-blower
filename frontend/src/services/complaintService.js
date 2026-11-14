import api from '../api/axios';

export const complaintService = {
    // ==== PUBLIC / CUSTOMER REGISTRATION ====
    sendOtp: async (email) => {
        const response = await api.post('/complaints/send-otp', { email_id: email });
        return response.data;
    },

    verifyOtp: async (otp, otpToken) => {
        const response = await api.post('/complaints/verify-otp', { otp, otp_token: otpToken });
        return response.data;
    },

    submitComplaint: async (formData) => {
        const response = await api.post('/complaints/submit_complaint', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // ==== LOGGED IN CUSTOMER ====
    getMyComplaints: async () => {
        const response = await api.get('/complaints/my-complaints');
        return response.data;
    },

    getMyComplaintById: async (id) => {
        const response = await api.get(`/complaints/my-complaints/${id}`);
        return response.data;
    },

    submitNewComplaint: async (formData) => {
        const response = await api.post('/complaints/submit_new_complaint', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // ==== ADMIN ====
    getAllComplaints: async () => {
        const response = await api.get('/complaints/admin/all');
        return response.data;
    },

    getComplaintById: async (id) => {
        const response = await api.get(`/complaints/admin/${id}`);
        return response.data;
    },

    updateComplaintStatus: async (id, data) => {
        const response = await api.put(`/complaints/admin/${id}/status`, data);
        return response.data;
    },

    // ==== PDF ====
    getPdfUrl: (id) => {
        const token = localStorage.getItem('token');
        return `${import.meta.env.VITE_API_BASE_URL}/complaints/pdf/${id}?token=${token}`;
    }
};