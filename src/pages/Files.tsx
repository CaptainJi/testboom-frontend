import { useState, useEffect } from 'react';
import { Upload, FileType, AlertCircle } from 'lucide-react';
import { fileApi, caseApi } from '../api/services';
import type { FileItem } from '../types/api';

const Files = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    // 获取文件列表
    const fetchFiles = async () => {
        try {
            setLoading(true);
            const response = await fileApi.getList({
                page: 1,
                page_size: 10
            });
            console.log('API Response:', response); // 添加日志
            if (response.code === 200 && response.data) {
                console.log('File List:', response.data); // 添加日志
                console.log('Items:', response.data.items); // 添加日志
                console.log('Total:', response.data.total); // 添加日志
                setFiles(response.data.items || []);
                setTotal(response.data.total || 0);
            } else {
                console.error('获取文件列表失败:', response);
                setFiles([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('获取文件列表出错:', error);
            setFiles([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // 组件加载时获取文件列表
    useEffect(() => {
        fetchFiles();
    }, []);

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
            try {
                const response = await fileApi.upload(file);
                if (response.code === 200) {
                    fetchFiles(); // 重新获取文件列表
                } else {
                    console.error('文件上传失败:', response);
                }
            } catch (error) {
                console.error('文件上传失败:', error);
            }
        }
    };

    // 处理文件上传
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const response = await fileApi.upload(file);
                if (response.code === 200) {
                    fetchFiles(); // 重新获取文件列表
                } else {
                    console.error('文件上传失败:', response);
                }
            } catch (error) {
                console.error('文件上传失败:', error);
            }
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

    return (
        <div className="space-y-6">
            {/* 上传区域 */}
            <div
                className={`hover-card glow relative rounded-lg border-2 border-dashed p-12 text-center ${isDragging
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-slate-700 hover:border-cyan-500/50'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-cyan-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-200">拖拽文件到这里上传</h3>
                    <p className="mt-2 text-sm text-slate-400">
                        支持 .zip 格式的需求文档
                    </p>
                    <div className="mt-4">
                        <label
                            htmlFor="file-upload"
                            className="btn-gradient inline-flex cursor-pointer items-center rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                        >
                            选择文件
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".zip"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* 文件列表 */}
            <div className="hover-card glow rounded-lg">
                <div className="p-4">
                    <h3 className="text-lg font-medium text-slate-200">已上传文件 ({total})</h3>
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
                            {files.map((file) => (
                                <div key={file.id} className="flex items-center justify-between py-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{file.name}</p>
                                        <p className="text-sm text-slate-400">{getStatusText(file.status)}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {file.status === 'completed' && (
                                            <button
                                                className="btn-gradient rounded-md px-3 py-1 text-sm text-white"
                                                onClick={async () => {
                                                    try {
                                                        const response = await caseApi.generate({
                                                            file_id: file.id,
                                                            project_name: file.name.split('.')[0]
                                                        });
                                                        if (response.code === 200) {
                                                            console.log('生成用例任务已提交:', response.data);
                                                        } else {
                                                            console.error('生成用例失败:', response);
                                                        }
                                                    } catch (error) {
                                                        console.error('生成用例失败:', error);
                                                    }
                                                }}
                                            >
                                                生成用例
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 上传说明 */}
            <div className="hover-card glow rounded-lg p-4">
                <div className="flex items-start space-x-4">
                    <AlertCircle className="h-5 w-5 text-cyan-400" />
                    <div>
                        <h4 className="text-sm font-medium text-slate-200">上传说明</h4>
                        <ul className="mt-2 list-inside list-disc text-sm text-slate-400">
                            <li>支持上传 .zip 格式的需求文档</li>
                            <li>文件大小不超过 50MB</li>
                            <li>文档内容需要符合规范要求</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Files; 