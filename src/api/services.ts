import type { AxiosProgressEvent } from 'axios';
import apiClient from './config';
import type { ApiResponse, FileItem, TestCase, Task, DashboardStats, CaseGenerateRequest, ExportRequest, FileList, TestCaseList, TaskList, PlantUMLStatus, PlantUMLContent } from '../types/api';

// 文件相关接口
export const fileApi = {
    // 上传文件
    upload: async (file: File): Promise<ApiResponse<FileItem>> => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiClient.post<ApiResponse<FileItem>>('/api/v1/files/upload', formData, {
            headers: {
                // 不要手动设置 Content-Type，让浏览器自动处理
                // 'Content-Type': 'multipart/form-data',
            },
            // 增加超时时间
            timeout: 300000, // 5分钟
            // 允许跨域请求携带凭证
            withCredentials: true,
            // 关闭大小限制
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            // 添加上传进度处理
            onUploadProgress: (progressEvent: any) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log('上传进度:', percentCompleted + '%');
                }
            },
            // 确保请求超时时有正确的错误处理
            validateStatus: function (status) {
                return status >= 200 && status < 300; // 默认值
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
    // 删除文件
    delete: async (fileId: string): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.delete<ApiResponse<boolean>>(`/api/v1/files/${fileId}`);
        return response.data;
    },
    // 批量删除文件
    batchDelete: async (fileIds: string[]): Promise<ApiResponse<Record<string, boolean>>> => {
        const response = await apiClient.delete<ApiResponse<Record<string, boolean>>>('/api/v1/files', {
            data: { file_ids: fileIds }
        });
        return response.data;
    },
};

// 测试用例相关接口
export const caseApi = {
    // 获取用例列表
    getList: async (params?: {
        project?: string;
        module?: string;
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
    generate: async (params: CaseGenerateRequest): Promise<ApiResponse<string>> => {
        const response = await apiClient.post<ApiResponse<string>>('/api/v1/cases/generate', params);
        return response.data;
    },
    // 导出用例到Excel
    exportToExcel: async (data: ExportRequest): Promise<Blob> => {
        const response = await apiClient.post('/api/v1/cases/export/excel', data, {
            responseType: 'blob',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },
    // 获取任务列表
    getTasks: async (params?: {
        type?: string;
        status?: string;
        page?: number;
        page_size?: number;
    }): Promise<ApiResponse<TaskList>> => {
        const response = await apiClient.get<ApiResponse<TaskList>>('/api/v1/cases/tasks', { 
            params: {
                type: params?.type,
                status: params?.status,
                page: params?.page || 1,
                page_size: params?.page_size || 10
            }
        });
        return response.data;
    },
    // 获取任务状态
    getTaskStatus: async (taskId: string): Promise<ApiResponse<Task>> => {
        const response = await apiClient.get<ApiResponse<Task>>(`/api/v1/cases/tasks/${taskId}`);
        return response.data;
    },
    // 获取思维导图状态
    getPlantUMLStatus: async (taskId: string, params?: { page_size?: number; modules?: string[] }) => {
        const queryParams = new URLSearchParams();
        if (params?.page_size) {
            queryParams.append('page_size', params.page_size.toString());
        }
        if (params?.modules && params.modules.length > 0) {
            queryParams.append('modules', params.modules.join(','));
        }
        const queryString = queryParams.toString();
        const url = `/api/v1/cases/plantuml/status/${taskId}${queryString ? `?${queryString}` : ''}`;
        console.log('请求思维导图URL:', url); // 添加日志
        const response = await fetch(url);
        return response.json();
    },
    // 获取思维导图内容
    getPlantUMLContent: async (taskId: string): Promise<ApiResponse<PlantUMLContent>> => {
        const response = await apiClient.get<ApiResponse<PlantUMLContent>>(`/api/v1/cases/plantuml/content/${taskId}`);
        return response.data;
    },
    // 导出思维导图
    exportPlantUML: async (taskId: string, format: 'svg' | 'png' = 'svg'): Promise<Blob> => {
        const response = await apiClient.post<Blob>(
            `/api/v1/cases/plantuml/export/${taskId}?format=${format}`,
            {},
            { responseType: 'blob' }
        );
        return response.data;
    },
    // 删除单个用例
    deleteCase: async (caseId: string): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.delete<ApiResponse<boolean>>(`/api/v1/cases/${caseId}`);
        return response.data;
    },
    // 更新用例
    updateCase: async (caseId: string, data: Partial<TestCase>): Promise<ApiResponse<TestCase>> => {
        const response = await apiClient.put<ApiResponse<TestCase>>(`/api/v1/cases/${caseId}`, data);
        return response.data;
    },
    // 批量删除用例
    batchDeleteCases: async (data: { case_ids: string[] }): Promise<ApiResponse<Record<string, boolean>>> => {
        const response = await apiClient.delete<ApiResponse<Record<string, boolean>>>('/api/v1/cases', {
            data
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
    // 删除任务
    deleteTask: async (taskId: string, deleteCases: boolean = false) => {
        const response = await fetch(`/api/v1/cases/tasks/${taskId}${deleteCases ? '?delete_cases=true' : ''}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
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