import apiClient from './config';
import type { ApiResponse, FileItem, TestCase, Task, DashboardStats, CaseGenerateRequest, ExportRequest, FileList, TestCaseList, TaskList } from '../types/api';

// 文件相关接口
export const fileApi = {
    // 上传文件
    upload: async (file: File): Promise<ApiResponse<FileItem>> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<ApiResponse<FileItem>>('/api/v1/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    // 获取文件列表
    getList: async (params?: { page?: number; page_size?: number; status?: string }): Promise<ApiResponse<FileList>> => {
        const response = await apiClient.get<ApiResponse<FileList>>('/api/v1/files/', { params });
        return response.data;
    },
    // 获取文件状态
    getStatus: async (fileId: string): Promise<ApiResponse<FileItem>> => {
        const response = await apiClient.get<ApiResponse<FileItem>>(`/api/v1/files/${fileId}`);
        return response.data;
    },
};

// 测试用例相关接口
export const caseApi = {
    // 获取用例列表
    getList: async (params?: {
        project?: string;
        module?: string;
        level?: string;
        task_id?: string;
        page?: number;
        page_size?: number;
    }): Promise<ApiResponse<TestCaseList>> => {
        const response = await apiClient.get<ApiResponse<TestCaseList>>('/api/v1/cases/', { params });
        return response.data;
    },
    // 获取用例详情
    getDetail: async (caseId: string): Promise<ApiResponse<TestCase>> => {
        const response = await apiClient.get<ApiResponse<TestCase>>(`/api/v1/cases/${caseId}`);
        return response.data;
    },
    // 生成用例
    generate: async (data: CaseGenerateRequest): Promise<ApiResponse<string>> => {
        const response = await apiClient.post<ApiResponse<string>>('/api/v1/cases/generate', data);
        return response.data;
    },
    // 导出用例到Excel
    exportToExcel: async (data: ExportRequest): Promise<Blob> => {
        const response = await apiClient.post('/api/v1/cases/export/excel', data, {
            responseType: 'blob'
        });
        return response.data;
    },
};

// 任务相关接口
export const taskApi = {
    // 获取任务列表
    getList: async (params?: {
        type?: string;
        status?: string;
        page?: number;
        page_size?: number;
    }): Promise<ApiResponse<TaskList>> => {
        const response = await apiClient.get<ApiResponse<TaskList>>('/api/v1/cases/tasks', { params });
        return response.data;
    },
    // 获取任务状态
    getStatus: async (taskId: string): Promise<ApiResponse<Task>> => {
        const response = await apiClient.get<ApiResponse<Task>>(`/api/v1/cases/tasks/${taskId}`);
        return response.data;
    },
};

// 仪表盘相关接口
export const statsApi = {
    // 获取仪表盘统计数据
    getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
        const response = await apiClient.get<ApiResponse<DashboardStats>>('/api/v1/dashboard');
        return response.data;
    },
}; 