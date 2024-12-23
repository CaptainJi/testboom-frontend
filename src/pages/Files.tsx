import { useState, useEffect } from 'react';
import { Upload, FileType, AlertCircle, Trash2, X } from 'lucide-react';
import { fileApi, caseApi } from '../api/services';
import type { FileItem } from '../types/api';

// 对话框组件
const Dialog = ({ isOpen, onClose, title, children }: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string;
    children: React.ReactNode;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-50 w-full max-w-md rounded-lg bg-slate-800 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-slate-200">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const Files = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [projectName, setProjectName] = useState('');
    const [moduleName, setModuleName] = useState('');
    const [generating, setGenerating] = useState(false);

    // 获取文件列表
    const fetchFiles = async () => {
        try {
            setLoading(true);
            const response = await fileApi.getList({
                page,
                page_size: pageSize
            });
            if (response.code === 200 && response.data) {
                setFiles(response.data.items);
                setTotal(response.data.total);
            }
        } catch (err) {
            console.error('获取文件列表失败:', err);
            setError('获取文件列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [page, pageSize]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            await handleFileUpload(file);
        }
    };

    // 处理文件上传
    const handleFileUpload = async (file: File) => {
        try {
            // 检查文件类型
            const allowedTypes = ['.zip', '.png', '.jpg', '.jpeg'];
            const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!allowedTypes.includes(fileExt)) {
                setError(`不支持的文件类型: ${fileExt}，仅支持 ${allowedTypes.join(', ')}`);
                return;
            }

            // 检查文件大小（50MB）
            const maxSize = 50 * 1024 * 1024;
            if (file.size > maxSize) {
                setError(`文件大小超过限制: ${(file.size / 1024 / 1024).toFixed(2)}MB，最大支持 50MB`);
                return;
            }

            console.log('开始上传文件:', {
                name: file.name,
                type: file.type,
                size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
            });

            setUploading(true);
            setError(null);

            const response = await fileApi.upload(file);
            console.log('上传响应:', response);

            if (response.code === 200) {
                await fetchFiles();
            } else {
                setError(`上传失败: ${response.message || '未知错误'}`);
                console.error('上传失败:', response);
            }
        } catch (err: any) {
            console.error('上传出错:', err);
            
            // 处理特定的错误类型
            if (err.response?.status === 413) {
                setError('文件大小超过服务器限制（最大支持50MB），请压缩后重试');
            } else {
                setError(`上传失败: ${err.message || '未知错误'}`);
            }
            
            // 如果是网络错误，添加更多信息
            if (err.response) {
                console.error('错误响应:', {
                    status: err.response.status,
                    statusText: err.response.statusText,
                    data: err.response.data
                });
            }
        } finally {
            setUploading(false);
        }
    };

    // 处理文件删除
    const handleDelete = async (fileId: string) => {
        if (!confirm('确定要删除这个文件吗？')) return;
        
        try {
            const response = await fileApi.delete(fileId);
            if (response.code === 200) {
                await fetchFiles();
            }
        } catch (err) {
            console.error('删除文件失败:', err);
            setError('删除文件失败');
        }
    };

    // 获取文件状态的中文描述
    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            'pending': '等待处理',
            'processing': '处理中',
            'completed': '已完成',
            'failed': '处理失败'
        };
        return statusMap[status] || status;
    };

    // 处理文件选择
    const handleSelectFile = (fileId: string) => {
        setSelectedFiles(prev => {
            if (prev.includes(fileId)) {
                return prev.filter(id => id !== fileId);
            } else {
                return [...prev, fileId];
            }
        });
    };

    // 处理全选
    const handleSelectAll = () => {
        if (selectedFiles.length === files.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(files.map(file => file.id));
        }
    };

    // 处理批量删除
    const handleBatchDelete = async () => {
        if (selectedFiles.length === 0) return;
        if (!confirm(`确定要删除选中的 ${selectedFiles.length} 个文件吗？`)) return;

        try {
            const response = await fileApi.batchDelete(selectedFiles);
            if (response.code === 200) {
                setSelectedFiles([]);
                await fetchFiles();
            }
        } catch (err) {
            console.error('批量删除失败:', err);
            setError('批量删除失败');
        }
    };

    // 处理生成用例
    const handleGenerateCase = async (file: FileItem) => {
        setSelectedFile(file);
        // 默认使用文件名（不包含扩展名）作为项目名称
        setProjectName(file.name.split('.')[0]);
        setModuleName('');
        setDialogOpen(true);
    };

    // 确认生成用例
    const handleConfirmGenerate = async () => {
        if (!selectedFile || !projectName.trim()) return;
        
        setGenerating(true);
        try {
            const response = await caseApi.generate({
                file_id: selectedFile.id,
                project_name: projectName.trim(),
                module_name: moduleName.trim() || undefined
            });
            if (response.code === 200 && response.data) {
                // 跳转到任务列表页面
                window.location.href = `/tasks?task_id=${response.data}`;
            }
        } catch (error) {
            console.error('生成用例失败:', error);
            setError('生成用例失败');
        } finally {
            setGenerating(false);
            setDialogOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* 错误提示 */}
            {error && (
                <div className="rounded-lg bg-red-500/10 p-4 text-red-500">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm whitespace-pre-wrap">{error}</p>
                    </div>
                </div>
            )}

            {/* 上传区域 */}
            <div
                className={`hover-card glow relative rounded-lg border-2 border-dashed p-12 text-center ${
                    isDragging
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : uploading
                        ? 'border-yellow-400 bg-yellow-500/10'
                        : 'border-slate-700 hover:border-cyan-500/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center">
                    <Upload className={`h-12 w-12 ${uploading ? 'text-yellow-400 animate-pulse' : 'text-cyan-400'}`} />
                    <h3 className="mt-4 text-lg font-medium text-slate-200">
                        {uploading ? '正在上传...' : '拖拽文件到这里上传'}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                        支持 .zip 格式的需求文档和图片文件
                    </p>
                    <div className="mt-4">
                        <label
                            htmlFor="file-upload"
                            className={`btn-gradient inline-flex cursor-pointer items-center rounded-md px-4 py-2 text-sm font-medium text-white ${
                                uploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                            }`}
                        >
                            {uploading ? '上传中...' : '选择文件'}
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".zip,.png,.jpg,.jpeg"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleFileUpload(file);
                                        e.target.value = '';
                                    }
                                }}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* 文件列表 */}
            <div className="hover-card glow rounded-lg">
                <div className="p-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-200">已上传文件 ({total})</h3>
                    {selectedFiles.length > 0 && (
                        <button
                            onClick={handleBatchDelete}
                            className="flex items-center space-x-2 text-red-400 hover:text-red-300"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>删除选中 ({selectedFiles.length})</span>
                        </button>
                    )}
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-sm text-slate-400">加载中...</p>
                            </div>
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <FileType className="mx-auto h-12 w-12 text-slate-500" />
                                <p className="mt-2 text-sm text-slate-400">暂无文件</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            <div className="flex items-center py-2 px-4">
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-700 bg-slate-800"
                                        checked={selectedFiles.length === files.length}
                                        onChange={handleSelectAll}
                                    />
                                    <span className="text-sm text-slate-400">全选</span>
                                </div>
                            </div>
                            {files.map((file) => (
                                <div key={file.id} className="flex items-center justify-between py-4 px-4">
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-700 bg-slate-800"
                                            checked={selectedFiles.includes(file.id)}
                                            onChange={() => handleSelectFile(file.id)}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{file.name}</p>
                                            <p className="text-sm text-slate-400">{getStatusText(file.status)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 pr-4">
                                        <button
                                            className="btn-gradient rounded-md px-3 py-1 text-sm text-white"
                                            onClick={() => handleGenerateCase(file)}
                                        >
                                            生成用例
                                        </button>
                                        <button
                                            className="text-sm text-red-400 hover:text-red-300"
                                            onClick={() => handleDelete(file.id)}
                                        >
                                            删除
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* 分页 */}
                {total > pageSize && (
                    <div className="flex items-center justify-between border-t border-slate-700 p-4">
                        <div className="text-sm text-slate-400">
                            共 {total} 个文件
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-md px-3 py-1 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50"
                            >
                                上一页
                            </button>
                            <span className="text-sm text-slate-400">
                                第 {page} / {Math.ceil(total / pageSize)} 页
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
                                disabled={page === Math.ceil(total / pageSize)}
                                className="rounded-md px-3 py-1 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50"
                            >
                                下一页
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 上传说明 */}
            <div className="hover-card glow rounded-lg p-4">
                <div className="flex items-start space-x-4">
                    <AlertCircle className="h-5 w-5 text-cyan-400" />
                    <div>
                        <h4 className="text-sm font-medium text-slate-200">上传说明</h4>
                        <ul className="mt-2 list-inside list-disc text-sm text-slate-400">
                            <li>支��上传 .zip 格的需求文档</li>
                            <li>支持上传 .png、.jpg、.jpeg 格式的图片</li>
                            <li>文件大小不超过 50MB</li>
                            <li>文档内容需要符合规范要求</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 生成用例对话框 */}
            <Dialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title="生成测试用例"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            项目名称 *
                        </label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                            placeholder="请输入项目名称"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            模块名称
                        </label>
                        <input
                            type="text"
                            value={moduleName}
                            onChange={(e) => setModuleName(e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                            placeholder="请输入模块名称（可选）"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={() => setDialogOpen(false)}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-300"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleConfirmGenerate}
                            disabled={!projectName.trim() || generating}
                            className={`btn-gradient rounded-md px-4 py-2 text-sm text-white ${
                                (!projectName.trim() || generating) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                            }`}
                        >
                            {generating ? '生成中...' : '确认生成'}
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Files; 