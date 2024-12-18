// 通用响应类型
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

// 文件相关类型
export interface FileItem {
    id: string;
    name: string;
    size: number;
    uploadTime: string;
    status: 'processing' | 'completed' | 'failed';
}

// 测试用例相关类型
export interface TestCase {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    status: 'draft' | 'ready' | 'exported';
}

// 任务相关类型
export interface Task {
    id: string;
    type: 'generate' | 'export';
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    createdAt: string;
    completedAt?: string;
    error?: string;
}

// 统计数据类型
export interface DashboardStats {
    fileCount: number;
    caseCount: number;
    taskCount: number;
    recentFiles: FileItem[];
    recentTasks: Task[];
} 