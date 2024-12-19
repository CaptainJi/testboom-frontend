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
    type: string;
    status: 'processing' | 'completed' | 'failed';
    path: string;
    error?: string;
    created_at: string;
    updated_at: string;
}

// 测试用例相关类型
export interface TestCase {
    case_id: string;
    project: string;
    module: string;
    name: string;
    level: string;
    status: string;
    content: Record<string, any>;
}

// 任务相关类型
export interface Task {
    task_id: string;
    type: string;
    status: string;
    progress: number;
    result?: Record<string, any> | TestCase[];
    error?: string;
    created_at: string;
    updated_at: string;
}

// 用例生成请求
export interface CaseGenerateRequest {
    file_id: string;
    project_name: string;
    module_name?: string;
}

// 用例导出请求
export interface ExportRequest {
    case_ids?: string[];
    project_name?: string;
    module_name?: string;
    task_id?: string;
}

// 文件状��
export interface FileStatus {
    id: string;
    status: string;
    storage_url?: string;
    error?: string;
}

// 仪表盘统计数据
export interface DashboardStats {
    total_files: number;
    total_cases: number;
    total_tasks: number;
    recent_files: FileItem[];
    recent_tasks: Task[];
} 