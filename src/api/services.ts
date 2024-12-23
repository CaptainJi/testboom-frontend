import type { AxiosProgressEvent } from 'axios';
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
        const response = await apiClient.get<ApiResponse<TaskList>>('/api/v1/cases/tasks', { params });
        return response.data;
    },
    // 获取任务状态
    getTaskStatus: async (taskId: string): Promise<ApiResponse<Task>> => {
        const response = await apiClient.get<ApiResponse<Task>>(`/api/v1/cases/tasks/${taskId}`);
        return response.data;
    }
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