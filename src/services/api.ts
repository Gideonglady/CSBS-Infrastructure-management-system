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

// Issue API endpoints
export const issueAPI = {
    create: async (issueData: any) => {
        const response = await api.post('/api/issues/create', issueData);
        return response;
    },

    getAll: async (filters?: { status?: string; priority?: string; category?: string; reporterId?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.reporterId) params.append('reporterId', filters.reporterId);

        const response = await api.get(`/api/issues?${params.toString()}`);
        return response;
    },

    getById: async (id: string) => {
        const response = await api.get(`/api/issues/${id}`);
        return response;
    },

    updateStatus: async (id: string, status: string, comment?: string) => {
        const response = await api.patch(`/api/issues/${id}/status`, { status, comment });
        return response;
    },

    addComment: async (id: string, content: string, isInternal?: boolean) => {
        const response = await api.post(`/api/issues/${id}/comment`, { content, isInternal });
        return response;
    },
};

// Notification API endpoints
export const notificationAPI = {
    getAll: async () => {
        const response = await api.get('/api/notifications');
        return response;
    },

    markAsRead: async (id: string) => {
        const response = await api.patch(`/api/notifications/${id}/read`);
        return response;
    },

    markAllAsRead: async () => {
        const response = await api.patch('/api/notifications/read-all');
        return response;
    },
};

export default api;

