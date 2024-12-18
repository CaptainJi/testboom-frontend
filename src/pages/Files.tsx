import { useState } from 'react';
import { Upload, FileType, AlertCircle } from 'lucide-react';

const Files = () => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        // TODO: 处理文件上传
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
                                onChange={(e) => {
                                    // TODO: 处理文件上传
                                }}
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* 文件列表 */}
            <div className="hover-card glow rounded-lg">
                <div className="p-4">
                    <h3 className="text-lg font-medium text-slate-200">已上传文件</h3>
                </div>
                <div className="p-4">
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <FileType className="mx-auto h-12 w-12 text-slate-500" />
                            <p className="mt-2 text-sm text-slate-400">暂无文件</p>
                        </div>
                    </div>
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