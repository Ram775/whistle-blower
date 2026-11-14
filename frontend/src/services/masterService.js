import api from '../api/axios';

export const masterService = {
    // ==== PUBLIC (Registration ke liye) ====
    getPublicDisclosures: async () => {
        const response = await api.get('/master/disclosure-details-public');
        return response.data;
    },

    getPublicVigilanceAngles: async () => {
        const response = await api.get('/master/vigilance-angles-public');
        return response.data;
    },

    // ==== ADMIN (CRUD) ====
    getStates: async () => {
        const response = await api.get('/master/states');
        return response.data;
    },
    getStateList: async () => {
        const response = await api.get('/master/states/list');
        return response.data;
    },
    createState: async (data) => {
        const response = await api.post('/master/states', data);
        return response.data;
    },
    updateState: async (id, data) => {
        const response = await api.put(`/master/states/${id}`, data);
        return response.data;
    },
    deleteStates: async (dataIds) => {
        const response = await api.post('/master/states/multiple_delete', { data_id: JSON.stringify(dataIds) });
        return response.data;
    },
    changeStateStatus: async (id, status) => {
        const response = await api.post('/master/states/change_status', { status_id: id, status });
        return response.data;
    },

    getDistricts: async () => {
        const response = await api.get('/master/districts');
        return response.data;
    },
    getDistrictsByState: async (stateId) => {
        const response = await api.post('/master/districts/get_list', { state_id: stateId });
        return response.data;
    },
    createDistrict: async (data) => {
        const response = await api.post('/master/districts', data);
        return response.data;
    },
    updateDistrict: async (id, data) => {
        const response = await api.put(`/master/districts/${id}`, data);
        return response.data;
    },
    deleteDistricts: async (dataIds) => {
        const response = await api.post('/master/districts/multiple_delete', { data_id: JSON.stringify(dataIds) });
        return response.data;
    },
    changeDistrictStatus: async (id, status) => {
        const response = await api.post('/master/districts/change_status', { status_id: id, status });
        return response.data;
    },

    getCities: async () => {
        const response = await api.get('/master/cities');
        return response.data;
    },
    getCitiesByDistrict: async (districtId) => {
        const response = await api.post('/master/cities/get_list', { district_id: districtId });
        return response.data;
    },
    createCity: async (data) => {
        const response = await api.post('/master/cities', data);
        return response.data;
    },
    updateCity: async (id, data) => {
        const response = await api.put(`/master/cities/${id}`, data);
        return response.data;
    },
    deleteCities: async (dataIds) => {
        const response = await api.post('/master/cities/multiple_delete', { data_id: JSON.stringify(dataIds) });
        return response.data;
    },
    changeCityStatus: async (id, status) => {
        const response = await api.post('/master/cities/change_status', { status_id: id, status });
        return response.data;
    },

    getCountries: async () => {
        const response = await api.get('/master/countries');
        return response.data;
    },
    getCountryList: async () => {
        const response = await api.get('/master/countries/list');
        return response.data;
    },
    createCountry: async (data) => {
        const response = await api.post('/master/countries', data);
        return response.data;
    },
    updateCountry: async (id, data) => {
        const response = await api.put(`/master/countries/${id}`, data);
        return response.data;
    },
    deleteCountries: async (dataIds) => {
        const response = await api.post('/master/countries/multiple_delete', { data_id: JSON.stringify(dataIds) });
        return response.data;
    },
    changeCountryStatus: async (id, status) => {
        const response = await api.post('/master/countries/change_status', { status_id: id, status });
        return response.data;
    },

    getVigilanceAngles: async () => {
        const response = await api.get('/master/vigilance-angles');
        return response.data;
    },
    createVigilanceAngle: async (data) => {
        const response = await api.post('/master/vigilance-angles', data);
        return response.data;
    },
    updateVigilanceAngle: async (id, data) => {
        const response = await api.put(`/master/vigilance-angles/${id}`, data);
        return response.data;
    },
    deleteVigilanceAngles: async (dataIds) => {
        const response = await api.post('/master/vigilance-angles/multiple_delete', { data_id: JSON.stringify(dataIds) });
        return response.data;
    },
    changeVigilanceAngleStatus: async (id, status) => {
        const response = await api.post('/master/vigilance-angles/change_status', { status_id: id, status });
        return response.data;
    },

    getDisclosures: async () => {
        const response = await api.get('/master/disclosure-details');
        return response.data;
    },
    createDisclosure: async (data) => {
        const response = await api.post('/master/disclosure-details', data);
        return response.data;
    },
    updateDisclosure: async (id, data) => {
        const response = await api.put(`/master/disclosure-details/${id}`, data);
        return response.data;
    },
    deleteDisclosures: async (dataIds) => {
        const response = await api.post('/master/disclosure-details/multiple_delete', { data_id: JSON.stringify(dataIds) });
        return response.data;
    },
    changeDisclosureStatus: async (id, status) => {
        const response = await api.post('/master/disclosure-details/change_status', { status_id: id, status });
        return response.data;
    },
};