import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const fileApi = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/api/v1/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    list: (params?: any) => api.get('/api/v1/files', { params }),
    getStatus: (fileId: string) => api.get(`/api/v1/files/${fileId}`),
};

export const caseApi = {
    generate: (data: any) => api.post('/api/v1/cases/generate', data),
    list: (params?: any) => api.get('/api/v1/cases', { params }),
    getDetail: (caseId: string) => api.get(`/api/v1/cases/${caseId}`),
    export: (data: any) => api.post('/api/v1/cases/export/excel', data),
};

export const taskApi = {
    list: (params?: any) => api.get('/api/v1/cases/tasks', { params }),
    getStatus: (taskId: string) => api.get(`/api/v1/cases/tasks/${taskId}`),
};

export default api; 