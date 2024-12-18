import apiClient from './config';
import type { ApiResponse, FileItem, TestCase, Task, DashboardStats } from '../types/api';

// 文件相关接口
export const fileApi = {
    // 上传文件
    upload: async (file: File): Promise<ApiResponse<FileItem>> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<ApiResponse<FileItem>>('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    },
    // 获取文件列表
    getList: async (): Promise<ApiResponse<FileItem[]>> => {
        const response = await apiClient.get<ApiResponse<FileItem[]>>('/files');
        return response;
    },
    // 删除文件
    delete: async (fileId: string): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete<ApiResponse<void>>(`/files/${fileId}`);
        return response;
    },
};

// 测试用例相关接口
export const caseApi = {
    // 获取用例列表
    getList: async (): Promise<ApiResponse<TestCase[]>> => {
        const response = await apiClient.get<ApiResponse<TestCase[]>>('/cases');
        return response;
    },
    // 获取用例详情
    getDetail: async (caseId: string): Promise<ApiResponse<TestCase>> => {
        const response = await apiClient.get<ApiResponse<TestCase>>(`/cases/${caseId}`);
        return response;
    },
    // 导出用例
    export: async (caseId: string): Promise<ApiResponse<string>> => {
        const response = await apiClient.get<ApiResponse<string>>(`/cases/${caseId}/export`);
        return response;
    },
};

// 任务相关接口
export const taskApi = {
    // 获取任务列表
    getList: async (): Promise<ApiResponse<Task[]>> => {
        const response = await apiClient.get<ApiResponse<Task[]>>('/tasks');
        return response;
    },
    // 获取任务详情
    getDetail: async (taskId: string): Promise<ApiResponse<Task>> => {
        const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`);
        return response;
    },
    // 获取任务状态
    getStatus: async (taskId: string): Promise<ApiResponse<Task>> => {
        const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}/status`);
        return response;
    },
};

// 统计相关接口
export const statsApi = {
    // 获取仪表盘统计数据
    getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
        const response = await apiClient.get<ApiResponse<DashboardStats>>('/stats/dashboard');
        return response;
    },
}; 