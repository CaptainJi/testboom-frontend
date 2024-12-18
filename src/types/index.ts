export interface FileInfo {
    name: string;
    type: string;
    status: string;
    id: string;
    path: string;
    error?: string;
    created_at: string;
    updated_at: string;
}

export interface CaseInfo {
    case_id: string;
    project: string;
    module: string;
    name: string;
    level: string;
    status: string;
    content: any;
}

export interface TaskInfo {
    task_id: string;
    type: string;
    status: string;
    progress: number;
    result?: any;
    error?: string;
    created_at: string;
    updated_at: string;
}

export interface CaseGenerateRequest {
    file_id: string;
    project_name: string;
    module_name?: string;
}

export interface ExportRequest {
    case_ids?: string[];
    project_name?: string;
    module_name?: string;
    task_id?: string;
}

export interface ResponseModel<T> {
    code: number;
    message: string;
    data: T;
} 