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
        // ✅ Naya Check: Login/OTP requests pe redirect nahi karna
        const url = error.config?.url || '';
        const isAuthRequest = 
            url.includes('/login') || 
            url.includes('/account_login') || 
            url.includes('/forgot-password') || 
            url.includes('/send-otp') || 
            url.includes('/verify-otp');

        if (error.response?.status === 401 && !isAuthRequest) {
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