// 通用响应类型
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T | null;
}

// 通用列表响应类型
export interface ListResponse<T> {
    total: number;
    items: T[];
}

// 文件相关类型
export interface FileItem {
    id: string;
    name: string;
    type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    path: string;
    error?: string;
    created_at: string;
    updated_at: string;
}

export interface FileList {
    total: number;
    items: FileItem[];
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

export interface TestCaseList extends ListResponse<TestCase> {}

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

export interface TaskList extends ListResponse<Task> {}

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

// 仪表盘统计数据
export interface DashboardStats {
    total_files: number;
    total_cases: number;
    recent_files: number;
    recent_cases: number;
    case_stats: {
        by_level: Record<string, number>;
        by_status: Record<string, number>;
    };
    file_stats: {
        by_type: Record<string, number>;
        by_status: Record<string, number>;
    };
} 