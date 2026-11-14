import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        
        // ✅ Ye saari requests public hain, inpe redirect NAHI karna
        const isPublicRequest = 
            url.includes('/login') || 
            url.includes('/account_login') || 
            url.includes('/forgot-password') || 
            url.includes('/send-otp') || 
            url.includes('/verify-otp') ||
            url.includes('-public') ||  // sliders-public, settings-public, etc.
            url.includes('/master/states/list') ||  // Registration dropdowns
            url.includes('/master/districts/get_list') ||
            url.includes('/master/cities/get_list') ||
            url.includes('/master/countries/list');

        // ✅ Sirf protected routes pe hi 401 handle karo
        if (error.response?.status === 401 && !isPublicRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/admin/login';
            } else {
                window.location.href = '/customer/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;