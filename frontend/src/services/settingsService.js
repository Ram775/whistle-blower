import api from '../api/axios';

export const settingsService = {
    // ==== SETTINGS ====
    getSettings: async () => {
        const response = await api.get('/admin/settings');
        return response.data;
    },
    updateSettings: async (data) => {
        const response = await api.post('/admin/settings', data);
        return response.data;
    },

    // ==== SLIDERS ====
    getSliders: async () => {
        const response = await api.get('/admin/sliders');
        return response.data;
    },
    createSlider: async (data) => {
        const response = await api.post('/admin/sliders', data);
        return response.data;
    },
    updateSlider: async (id, data) => {
        const response = await api.put(`/admin/sliders/${id}`, data);
        return response.data;
    },
    deleteSliders: async (dataIds) => {
        const response = await api.post('/admin/sliders/multiple_delete', { data_id: JSON.stringify(dataIds) });
        return response.data;
    },
    changeSliderStatus: async (id, status) => {
        const response = await api.post('/admin/sliders/change_status', { status_id: id, status });
        return response.data;
    },
    removeSliderImage: async (id, columnName) => {
        const response = await api.post('/admin/sliders/delete_image', { id, column_name: columnName });
        return response.data;
    },

    // ==== UPLOAD ====
    uploadSingleImage: async (formData) => {
        const response = await api.post('/upload/single_image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    removeSingleImage: async (deleteImagePath) => {
        const response = await api.post('/upload/remove_single_image', { delete_image: deleteImagePath });
        return response.data;
    }
};