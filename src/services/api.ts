import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

// Auth API endpoints
export const authAPI = {
    login: async (credentials: { email: string; password: string }) => {
        const response = await api.post('/api/auth/login', credentials);
        return response; // Interceptor already returns response.data
    },

    register: async (data: {
        email: string;
        password: string;
        name: string;
        role: string;
        department?: string;
        phone?: string;
    }) => {
        const response = await api.post('/api/auth/register', data);
        return response; // Interceptor already returns response.data
    },

    getCurrentUser: async () => {
        const response = await api.get('/api/auth/me');
        return response; // Interceptor already returns response.data
    },
};

export default api;
