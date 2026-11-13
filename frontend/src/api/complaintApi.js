import api from './axios';

export const getComplaints = async (status = null) => {
    // Backend me abhi humne status filter nahi lagaya hai, par hum frontend se filter kar sakte hain
    // Ya hum backend me query param bhej sakte hain (jo baad me add karenge)
    const response = await api.get('/complaints/admin/all');
    return response.data;
};

export const updateComplaintStatus = async (id, data) => {
    const response = await api.put(`/complaints/admin/${id}/status`, data);
    return response.data;
};