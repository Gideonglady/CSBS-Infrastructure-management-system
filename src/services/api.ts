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

    createUser: async (data: any) => {
        const response = await api.post('/api/auth/create-user', data);
        return response;
    },

    changePassword: async (data: any) => {
        const response = await api.put('/api/auth/change-password', data);
        return response;
    },
};

export const userAPI = {
    getAll: async () => {
        const response = await api.get('/api/users');
        return response;
    },
    deleteUser: async (id: string) => {
        const response = await api.delete(`/api/users/${id}`);
        return response;
    },
    update: async (id: string, userData: any) => {
        const response = await api.put(`/api/users/${id}`, userData);
        return response;
    },
    updateUserLocations: async (userId: string, locationIds: string[]) => {
        const response = await api.put(`/api/users/${userId}/locations`, { assignedLocations: locationIds });
        return response;
    },
    getUserLocations: async () => {
        const response = await api.get('/api/users/me/locations');
        return response;
    }
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

// Laboratory API endpoints
export const laboratoryAPI = {
    getAll: async (filters?: { type?: string; department?: string; search?: string; includeAll?: string }) => {
        const params = new URLSearchParams();
        if (filters?.type) params.append('type', filters.type);
        if (filters?.department) params.append('department', filters.department);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.includeAll) params.append('includeAll', filters.includeAll);

        const response = await api.get(`/api/laboratories?${params.toString()}`);
        return response;
    },

    getById: async (id: string) => {
        const response = await api.get(`/api/laboratories/${id}`);
        return response;
    },

    getStats: async () => {
        const response = await api.get('/api/laboratories/stats');
        return response;
    },

    create: async (data: any) => {
        const response = await api.post('/api/laboratories', data);
        return response;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/api/laboratories/${id}`, data);
        return response;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/api/laboratories/${id}`);
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

    delete: async (id: string) => {
        const response = await api.delete(`/api/notifications/${id}`);
        return response;
    },

    cleanupDuplicates: async () => {
        const response = await api.delete('/api/notifications/cleanup/duplicates');
        return response;
    },
};

// Lab Systems API endpoints
export const labSystemAPI = {
    getAll: async (params?: { search?: string; labName?: string; page?: number; limit?: number }) => {
        const response = await api.get('/api/lab-systems', { params });
        return response;
    },

    getLabsSummary: async () => {
        const response = await api.get('/api/lab-systems/labs');
        return response;
    },

    getById: async (id: string) => {
        const response = await api.get(`/api/lab-systems/${id}`);
        return response;
    },

    getByLabName: async (labName: string) => {
        const response = await api.get(`/api/lab-systems/lab/${encodeURIComponent(labName)}`);
        return response;
    },
};

// Upload API endpoints
export const uploadAPI = {
    uploadImages: async (files: File[]) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });
        const response = await api.post('/api/upload/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    },

    uploadDocuments: async (files: File[]) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('documents', file);
        });
        const response = await api.post('/api/upload/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    },
};

// Transfer Request API endpoints
export const transferAPI = {
    createRequest: async (data: {
        equipmentId: string;
        sourceLocation: string;
        destinationLocation: string;
        notes?: string;
    }) => {
        const response = await api.post('/api/transfer-requests', data);
        return response;
    },

    getAll: async (status?: string) => {
        const params = status ? { status } : {};
        const response = await api.get('/api/transfer-requests', { params });
        return response;
    },

    getById: async (id: string) => {
        const response = await api.get(`/api/transfer-requests/${id}`);
        return response;
    },

    approve: async (id: string, notes?: string) => {
        const response = await api.put(`/api/transfer-requests/${id}/approve`, { notes });
        return response;
    },

    reject: async (id: string, rejectionReason: string) => {
        const response = await api.put(`/api/transfer-requests/${id}/reject`, { rejectionReason });
        return response;
    },

    cancel: async (id: string) => {
        const response = await api.delete(`/api/transfer-requests/${id}`);
        return response;
    },
};

// Action Request API endpoints
export const actionsAPI = {
    submit: async (data: any) => {
        const response = await api.post('/api/actions', data);
        return response;
    },
    getPending: async () => {
        const response = await api.get('/api/actions/pending');
        return response;
    },
    getHistory: async () => {
        const response = await api.get('/api/actions/history');
        return response;
    },
    approve: async (id: string, notes?: string) => {
        const response = await api.put(`/api/actions/${id}/approve`, { notes });
        return response;
    },
    reject: async (id: string, reason: string) => {
        const response = await api.put(`/api/actions/${id}/reject`, { rejectionReason: reason });
        return response;
    },
    revert: async (id: string) => {
        const response = await api.post(`/api/actions/${id}/revert`);
        return response;
    },
    cancel: async (id: string) => {
        const response = await api.delete(`/api/transfer-requests/${id}`);
        return response;
    },
};

export default api;

