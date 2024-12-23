import { useState, useEffect } from 'react';
import { Filter, Download, ChevronRight, ChevronDown } from 'lucide-react';
import { caseApi } from '../api/services';
import type { TestCase } from '../types/api';
import * as Dialog from '@radix-ui/react-dialog';

const Cases = () => {
    const [cases, setCases] = useState<TestCase[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentTask, setCurrentTask] = useState<string | null>(null);
    const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [selectedCases, setSelectedCases] = useState<string[]>([]);
    const [exporting, setExporting] = useState(false);
    const [filters, setFilters] = useState({
        project: '',
        module: '',
        task_id: '',
        page: 1,
        page_size: 10
    });

    // 获取用例列表
    const fetchCases = async () => {
        setLoading(true);
        try {
            const response = await caseApi.getList(filters);
            console.log('API Response:', response);
            if (response.code === 200 && response.data) {
                console.log('Case List:', response.data);
                // 正确处理返回的数据结构
                setCases(response.data.items || []);
                setTotal(response.data.total || 0);
            } else {
                console.error('获取用例列表失败:', response);
                setCases([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('获取用例列表出错:', error);
            setCases([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // 检查任务状态
    const checkTaskStatus = async (taskId: string) => {
        try {
            const response = await caseApi.getTaskStatus(taskId);
            console.log('Task Status:', response);
            if (response.code === 200 && response.data) {
                const task = response.data;
                if (task.status === 'completed') {
                    // 任务完成，刷新用例列表
                    setFilters(prev => ({ ...prev, task_id: taskId }));
                    setCurrentTask(null);
                } else if (task.status === 'failed') {
                    console.error('任务失败:', task.error);
                    setCurrentTask(null);
                } else {
                    // 任务还在进行中，继续轮询
                    setTimeout(() => checkTaskStatus(taskId), 2000);
                }
            }
        } catch (error) {
            console.error('检查任务状态失败:', error);
            setCurrentTask(null);
        }
    };

    // 处理导出用例
    const handleExport = async () => {
        try {
            setExporting(true);
            // 如果选择了特定用例，获取这些用例的完整信息
            let exportCases = selectedCases.length > 0 
                ? cases.filter(c => selectedCases.includes(c.case_id))
                : cases;

            const response = await caseApi.exportToExcel({
                cases: exportCases,  // 传递完整的用例对象数组
                project_name: filters.project || undefined,
                module_name: filters.module || undefined
            });

            // 检查响应类型
            if (response instanceof Blob) {
                // 创建下载链接
                const url = window.URL.createObjectURL(response);
                const link = document.createElement('a');
                link.href = url;
                const fileName = `测试用例_${new Date().toLocaleDateString()}.xlsx`;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                setExportDialogOpen(false);
            } else {
                throw new Error('导出失败：响应格式不正确');
            }
        } catch (error) {
            console.error('导出用例失败:', error);
            // 显示错误消息
            alert(error instanceof Error ? error.message : '导出失败，请重试');
        } finally {
            setExporting(false);
        }
    };

    // 处理用例选择
    const handleCaseSelect = (caseId: string) => {
        setSelectedCases(prev => {
            if (prev.includes(caseId)) {
                return prev.filter(id => id !== caseId);
            } else {
                return [...prev, caseId];
            }
        });
    };

    // 处理全选
    const handleSelectAll = async () => {
        if (selectedCases.length === total) {
            // 如果已经全选，则取消全选
            setSelectedCases([]);
        } else {
            // 如果未全选，获取所有用例的ID
            try {
                setLoading(true);
                const allCases = [];
                const totalPages = Math.ceil(total / filters.page_size);
                
                // 获取所有页的用例
                for (let page = 1; page <= totalPages; page++) {
                    const response = await caseApi.getList({
                        ...filters,
                        page,
                        page_size: filters.page_size
                    });
                    if (response.code === 200 && response.data) {
                        allCases.push(...response.data.items);
                    }
                }
                
                // 设置所有用例的ID
                setSelectedCases(allCases.map(c => c.case_id));
            } catch (error) {
                console.error('获取所有用例失败:', error);
                // 如果获取失败，至少选中当前页的用例
                setSelectedCases(cases.map(c => c.case_id));
            } finally {
                setLoading(false);
            }
        }
    };

    // 获取用例等级的中文描述
    const getLevelText = (level: string) => {
        const levelMap: Record<string, string> = {
            'P0': 'P0-高',
            'P1': 'P1-中',
            'P2': 'P2-低'
        };
        return levelMap[level] || level;
    };

    // 获取用例状态的中文描述
    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            'draft': '草稿',
            'reviewing': '审核中',
            'approved': '已通过',
            'rejected': '已拒绝'
        };
        return statusMap[status] || status;
    };

    // 渲染用例内容
    const renderCaseContent = (content: Record<string, any>) => {
        console.log('Case Content:', content);
        
        return (
            <div className="mt-4 space-y-4">
                {/* 前置条件 */}
                <div>
                    <h5 className="text-sm font-medium text-slate-300">前置条件</h5>
                    <p className="mt-1 text-sm text-slate-400 whitespace-pre-wrap">
                        {content.precondition || '-'}
                    </p>
                </div>
                
                {/* 测试步骤和预期结果 */}
                <div>
                    <h5 className="text-sm font-medium text-slate-300">测试步骤和预期结果</h5>
                    <div className="mt-2 divide-y divide-slate-700/50">
                        {(content.steps || []).map((step: string, index: number) => (
                            <div key={index} className="py-2">
                                <div className="flex items-start space-x-4">
                                    <span className="mt-1 text-xs text-slate-500">{index + 1}.</span>
                                    <div className="flex-1 space-y-2">
                                        <div>
                                            <span className="text-sm text-slate-300">步骤：</span>
                                            <span className="text-sm text-slate-400">{step}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-300">预期：</span>
                                            <span className="text-sm text-slate-400">
                                                {content.expected?.[index] || '-'}
                                            </span>
                                        </div>
                                        {content.actual && (
                                            <div>
                                                <span className="text-sm text-slate-300">实际：</span>
                                                <span className="text-sm text-slate-400">
                                                    {content.actual[index] || '-'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 备注 */}
                <div>
                    <h5 className="text-sm font-medium text-slate-300">备注</h5>
                    <p className="mt-1 text-sm text-slate-400 whitespace-pre-wrap">
                        {content.remark || '-'}
                    </p>
                </div>

                {/* 如果没有任何内容，显示提示信息 */}
                {!content.precondition && !content.steps?.length && !content.remark && (
                    <div className="text-center text-sm text-slate-400">
                        暂无详细内容
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => {
        // 从URL中获取task_id参数
        const urlParams = new URLSearchParams(window.location.search);
        const taskId = urlParams.get('task_id');
        if (taskId) {
            setCurrentTask(taskId);
            setFilters(prev => ({ ...prev, task_id: taskId }));
            // 开始轮询任务状态
            checkTaskStatus(taskId);
        }
    }, []);

    useEffect(() => {
        fetchCases();
    }, [filters]);

    return (
        <div className="space-y-6">
            {/* 筛选和操作栏 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button className="inline-flex items-center space-x-2 rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">
                        <Filter className="h-4 w-4" />
                        <span>筛选</span>
                    </button>
                    <div className="flex items-center space-x-2">
                        <select 
                            className="rounded-md border bg-background px-3 py-2 text-sm"
                            value={filters.project}
                            onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
                        >
                            <option value="">所有项目</option>
                            {/* 这里可以添加项目选项 */}
                        </select>
                        <select 
                            className="rounded-md border bg-background px-3 py-2 text-sm"
                            value={filters.module}
                            onChange={(e) => setFilters(prev => ({ ...prev, module: e.target.value }))}
                        >
                            <option value="">所有模块</option>
                            {/* 这里可以添加模块选项 */}
                        </select>
                    </div>
                </div>
                <button 
                    className="inline-flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    onClick={() => setExportDialogOpen(true)}
                >
                    <Download className="h-4 w-4" />
                    <span>导出用例</span>
                </button>
            </div>

            {/* 用例列表 */}
            <div className="hover-card glow rounded-lg">
                <div className="p-4">
                    <h3 className="text-lg font-medium text-slate-200">测试用例列表 ({total})</h3>
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-sm text-slate-400">加载中...</p>
                            </div>
                        </div>
                    ) : cases.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-sm text-slate-400">暂无数据</p>
                                <p className="mt-1 text-sm text-slate-400">请先上传需求文档并生成用例</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* 全选区域 */}
                            <div className="flex items-center space-x-4 px-4 mb-4 pb-4 border-b border-slate-700">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        checked={selectedCases.length === total && total > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 focus:ring-primary"
                                    />
                                </div>
                                <span className="text-sm text-slate-400">全选</span>
                            </div>
                            {/* 用例列表 */}
                            <div className="divide-y divide-slate-700">
                                {cases.map((testCase) => (
                                    <div
                                        key={testCase.case_id}
                                        className="py-4 px-4 hover:bg-slate-800/50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 flex-1">
                                                {/* 选择框 */}
                                                <div className="flex items-center h-5">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCases.includes(testCase.case_id)}
                                                        onChange={() => handleCaseSelect(testCase.case_id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 focus:ring-primary"
                                                    />
                                                </div>
                                                {/* 内容区域 */}
                                                <div 
                                                    className="flex-1 cursor-pointer"
                                                    onClick={() => setExpandedCaseId(
                                                        expandedCaseId === testCase.case_id ? null : testCase.case_id
                                                    )}
                                                >
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-medium text-slate-400 mr-3">
                                                            {testCase.content?.id || '-'}
                                                        </span>
                                                        <h4 className="text-sm font-medium text-slate-200">{testCase.name}</h4>
                                                    </div>
                                                    <div className="mt-1 flex items-center space-x-2">
                                                        <span className="px-2 py-0.5 text-xs rounded-md bg-blue-500/10 text-blue-400">
                                                            {testCase.project}
                                                        </span>
                                                        <span className="text-xs text-slate-500">/</span>
                                                        <span className="px-2 py-0.5 text-xs rounded-md bg-purple-500/10 text-purple-400">
                                                            {testCase.module}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    testCase.level === 'P0' ? 'bg-red-500/10 text-red-400' :
                                                    testCase.level === 'P1' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-green-500/10 text-green-400'
                                                }`}>
                                                    {getLevelText(testCase.level)}
                                                </span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    testCase.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                                    testCase.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                                    testCase.status === 'reviewing' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                    {getStatusText(testCase.status)}
                                                </span>
                                                {/* 展开/关闭箭头 */}
                                                {expandedCaseId === testCase.case_id ? (
                                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* 用例详情 */}
                                        {expandedCaseId === testCase.case_id && (
                                            <div className="mt-4 border-t border-slate-700 pt-4 ml-8">
                                                {renderCaseContent(testCase.content)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                {/* 分页 */}
                {total > filters.page_size && (
                    <div className="flex items-center justify-between border-t border-slate-700 p-4">
                        <div className="text-sm text-slate-400">
                            共 {total} 个用例
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                disabled={filters.page === 1}
                                className="rounded-md px-3 py-1 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50"
                            >
                                上一页
                            </button>
                            <span className="text-sm text-slate-400">
                                第 {filters.page} / {Math.ceil(total / filters.page_size)} 页
                            </span>
                            <button
                                onClick={() => setFilters(prev => ({ 
                                    ...prev, 
                                    page: Math.min(Math.ceil(total / filters.page_size), prev.page + 1) 
                                }))}
                                disabled={filters.page === Math.ceil(total / filters.page_size)}
                                className="rounded-md px-3 py-1 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50"
                            >
                                下一页
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 用例统计 */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="hover-card glow rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-400">总用例数</h4>
                    <p className="mt-2 text-2xl font-bold text-slate-200">{total}</p>
                </div>
                <div className="hover-card glow rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-400">已通过</h4>
                    <p className="mt-2 text-2xl font-bold text-slate-200">
                        {cases.filter(c => c.status === 'approved').length}
                    </p>
                </div>
                <div className="hover-card glow rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-400">审核中</h4>
                    <p className="mt-2 text-2xl font-bold text-slate-200">
                        {cases.filter(c => c.status === 'reviewing').length}
                    </p>
                </div>
            </div>

            {/* 导出对话框 */}
            <Dialog.Root open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-slate-800 p-6 shadow-lg">
                        <Dialog.Title className="text-lg font-medium text-slate-200 mb-4">
                            导出测试用例
                        </Dialog.Title>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    导出范围
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            checked={selectedCases.length === 0}
                                            onChange={() => setSelectedCases([])}
                                            className="rounded border-slate-700 bg-slate-900"
                                        />
                                        <span className="text-sm text-slate-200">导出全部用例</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            checked={selectedCases.length > 0}
                                            onChange={() => setSelectedCases(cases.map(c => c.case_id))}
                                            className="rounded border-slate-700 bg-slate-900"
                                        />
                                        <span className="text-sm text-slate-200">仅导出选中用例 ({selectedCases.length})</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <Dialog.Close asChild>
                                    <button
                                        className="px-4 py-2 text-sm text-slate-400 hover:text-slate-300"
                                    >
                                        取消
                                    </button>
                                </Dialog.Close>
                                <button
                                    onClick={handleExport}
                                    disabled={exporting}
                                    className={`btn-gradient rounded-md px-4 py-2 text-sm text-white ${
                                        exporting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                                    }`}
                                >
                                    {exporting ? '导出中...' : '确认导出'}
                                </button>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
};

export default Cases; 