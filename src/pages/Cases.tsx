import { useState, useEffect } from 'react';
import { Filter, Download, ChevronRight, ChevronDown } from 'lucide-react';
import { caseApi } from '../api/services';
import type { TestCase, TaskInfo } from '../types/api';
import * as Dialog from '@radix-ui/react-dialog';
import MindMap from '../components/MindMap';

const Cases = () => {
    const [cases, setCases] = useState<TestCase[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentTask, setCurrentTask] = useState<string | null>(null);
    const [tasks, setTasks] = useState<TaskInfo[]>([]);
    const [projects, setProjects] = useState<string[]>([]);
    const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [selectedCases, setSelectedCases] = useState<string[]>([]);
    const [exporting, setExporting] = useState(false);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [selectedModules, setSelectedModules] = useState<Record<string, string[]>>({});
    const [filters, setFilters] = useState({
        project: '',
        module: '',
        task_id: '',
        page: 1,
        page_size: 10
    });
    const [editingCase, setEditingCase] = useState<TestCase | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!editDialogOpen) {
            // 当对话框关闭时，清理编辑状态
            setEditingCase(null);
        }
    }, [editDialogOpen]);

    // 获取任务列表
    const fetchTasks = async () => {
        try {
            console.log('开始获取任务列表...');
            const response = await caseApi.getTasks({
                page: 1,
                page_size: 100
            });
            console.log('任务列表响应:', response);
            
            if (response.code === 200 && response.data) {
                // response.data 直接就是任务数组
                const taskList = response.data;
                console.log('任务列表:', taskList);
                setTasks(taskList);
            }
        } catch (error) {
            console.error('获取任务列表失败:', error);
            setTasks([]);
        }
    };

    // 获取所有项目列表
    const updateProjectsList = (caseList: TestCase[]) => {
        const uniqueProjects = Array.from(new Set(caseList.map(c => c.project))).sort();
        setProjects(uniqueProjects);
    };

    // 获取用例列表
    const fetchCases = async () => {
        setLoading(true);
        try {
            const response = await caseApi.getList(filters);
            console.log('API Response:', response);
            if (response.code === 200 && response.data) {
                console.log('Case List:', response.data);
                const caseList = response.data.items || [];
                setCases(caseList);
                setTotal(response.data.total || 0);
                updateProjectsList(caseList);
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

    // 处理任务切换
    const handleTaskChange = (taskId: string, selectedModules: string[] = []) => {
        console.log('Switching to task:', taskId, 'Selected modules:', selectedModules);
        setCurrentTask(taskId);
        
        // 更新过滤条件
        setFilters(prev => {
            const newFilters = {
                ...prev,
                task_id: taskId,
                page: 1,
                // 如果选择了特定模块，则添加到过滤条件中
                module: selectedModules.length === 1 ? selectedModules[0] : ''
            };
            console.log('New filters:', newFilters);
            return newFilters;
        });
        
        // 清空选中的用例
        setSelectedCases([]);
        // 重置展开的用例
        setExpandedCaseId(null);
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

    // 渲染任务选择对话框
    const renderTaskDialog = () => {
        const handleModuleSelect = (taskId: string, moduleName: string, checked: boolean) => {
            setSelectedModules(prev => {
                const currentModules = prev[taskId] || [];
                if (checked) {
                    return {
                        ...prev,
                        [taskId]: [...currentModules, moduleName]
                    };
                } else {
                    return {
                        ...prev,
                        [taskId]: currentModules.filter(m => m !== moduleName)
                    };
                }
            });
        };

        const handleSelectAllModules = (taskId: string, moduleNames: string[], checked: boolean) => {
            setSelectedModules(prev => ({
                ...prev,
                [taskId]: checked ? moduleNames : []
            }));
        };

        return (
            <Dialog.Root open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-slate-900 p-6 shadow-lg w-[600px] border border-slate-800">
                        <Dialog.Title className="text-lg font-medium text-slate-200 mb-4 flex justify-between items-center">
                            <span>选择任务</span>
                            <span className="text-sm text-slate-400">
                                共 {tasks.length} 个任务
                            </span>
                        </Dialog.Title>
                        <div className="space-y-4">
                            {tasks.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    暂无任务数据
                                </div>
                            ) : (
                                <div className="max-h-[400px] overflow-y-auto">
                                    {tasks.map((task) => (
                                        <div key={task.task_id} className="mb-4">
                                            <div
                                                className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-slate-800/50 ${
                                                    currentTask === task.task_id ? 'bg-slate-800/50' : ''
                                                }`}
                                                onClick={() => {
                                                    if (task.result?.module_names?.length) {
                                                        setExpandedTaskId(
                                                            expandedTaskId === task.task_id ? null : task.task_id
                                                        );
                                                    } else {
                                                        handleTaskChange(task.task_id);
                                                        setTaskDialogOpen(false);
                                                    }
                                                }}
                                            >
                                                <div>
                                                    <div className="text-sm font-medium text-slate-200">
                                                        {task.result?.project_name || '未命名项目'} - {task.result?.cases_count || 0} 个用例
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        创建时间：{new Date(task.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className={`px-2 py-1 text-xs rounded-full ${
                                                        task.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                        task.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-yellow-500/10 text-yellow-400'
                                                    }`}>
                                                        {task.status === 'completed' ? '已完成' :
                                                         task.status === 'failed' ? '失败' : '进行中'}
                                                    </div>
                                                    {task.result?.module_names?.length > 0 && (
                                                        <ChevronDown
                                                            className={`h-4 w-4 text-slate-400 transform transition-transform ${
                                                                expandedTaskId === task.task_id ? 'rotate-180' : ''
                                                            }`}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            {/* 模块选择区域 */}
                                            {expandedTaskId === task.task_id && task.result?.module_names && (
                                                <div className="mt-2 ml-4 p-3 bg-slate-800/50 rounded-md border border-slate-700">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedModules[task.task_id]?.length === task.result.module_names.length}
                                                                onChange={(e) => handleSelectAllModules(
                                                                    task.task_id,
                                                                    task.result.module_names,
                                                                    e.target.checked
                                                                )}
                                                                className="rounded border-slate-600 bg-slate-950"
                                                            />
                                                            <span className="text-sm text-slate-300">全选</span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                handleTaskChange(
                                                                    task.task_id,
                                                                    selectedModules[task.task_id] || []
                                                                );
                                                                setTaskDialogOpen(false);
                                                            }}
                                                            className="text-sm text-blue-400 hover:text-blue-300"
                                                        >
                                                            确认选择
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {task.result.module_names.map((moduleName) => (
                                                            <label
                                                                key={moduleName}
                                                                className="flex items-center space-x-2 p-2 hover:bg-slate-700/50 rounded"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedModules[task.task_id]?.includes(moduleName)}
                                                                    onChange={(e) => handleModuleSelect(
                                                                        task.task_id,
                                                                        moduleName,
                                                                        e.target.checked
                                                                    )}
                                                                    className="rounded border-slate-600 bg-slate-950"
                                                                />
                                                                <span className="text-sm text-slate-300">{moduleName}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-end space-x-3 mt-6">
                                <Dialog.Close asChild>
                                    <button className="px-4 py-2 text-sm text-slate-400 hover:text-slate-300">
                                        取消
                                    </button>
                                </Dialog.Close>
                                <button
                                    onClick={fetchTasks}
                                    className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                    刷新列表
                                </button>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        );
    };

    // 处理单个用例删除
    const handleDeleteCase = async (caseId: string) => {
        try {
            const response = await caseApi.deleteCase(caseId);
            if (response.code === 200 && response.data) {
                // 刷新用例列表
                fetchCases();
                // 清除选中状态
                setSelectedCases(prev => prev.filter(id => id !== caseId));
            }
        } catch (error) {
            console.error('删除用例失败:', error);
            alert('删除用例失败，请重试');
        }
    };

    // 处理批量删除用例
    const handleBatchDelete = async () => {
        if (selectedCases.length === 0) {
            alert('请先选择要删除的用例');
            return;
        }

        if (!confirm(`确定要删除选中的 ${selectedCases.length} 个用例吗？`)) {
            return;
        }

        try {
            const response = await caseApi.batchDeleteCases({
                case_ids: selectedCases
            });
            if (response.code === 200 && response.data) {
                // 刷新用例列表
                fetchCases();
                // 清除选中状态
                setSelectedCases([]);
            }
        } catch (error) {
            console.error('批量删除用例失败:', error);
            alert('批量删除用例失败，请重试');
        }
    };

    // 处理用例编辑
    const handleEditCase = async (updatedData: Partial<TestCase>) => {
        if (!editingCase) return;
        
        try {
            setUpdating(true);
            const response = await caseApi.updateCase(editingCase.case_id, {
                ...updatedData,
                project: editingCase.project, // 保持项目名不变
                module: editingCase.module,   // 保持模块名不变
                content: {
                    ...editingCase.content,
                    precondition: typeof updatedData.content?.preconditions === 'string' 
                        ? updatedData.content.preconditions
                        : updatedData.content?.preconditions || '',
                    steps: updatedData.content?.steps || [],
                    expected: updatedData.content?.expected || [],
                }
            });
            if (response.code === 200 && response.data) {
                // 刷新用例列表
                fetchCases();
                setEditDialogOpen(false);
                setEditingCase(null);
            }
        } catch (error) {
            console.error('更新用例失败:', error);
            alert('更新用例失败，请重试');
        } finally {
            setUpdating(false);
        }
    };

    // 渲染编辑对话框
    const renderEditDialog = () => (
        <Dialog.Root 
            open={editDialogOpen} 
            onOpenChange={setEditDialogOpen}
        >
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-slate-900 p-6 shadow-lg w-[800px] border border-slate-800 max-h-[90vh] overflow-y-auto">
                    {editingCase && (
                        <>
                            <Dialog.Title className="text-lg font-medium text-slate-200 mb-4">
                                编辑用例
                            </Dialog.Title>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                handleEditCase({
                                    name: formData.get('name') as string,
                                    level: formData.get('level') as string,
                                    status: formData.get('status') as string,
                                    content: {
                                        preconditions: formData.get('preconditions') as string,
                                        steps: (formData.get('steps') as string).split('\n').filter(Boolean),
                                        expected: (formData.get('expected') as string).split('\n').filter(Boolean),
                                    }
                                });
                            }}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                                项目名称
                                            </label>
                                            <input
                                                name="project"
                                                value={editingCase.project}
                                                className="w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-400"
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                                模块名称
                                            </label>
                                            <input
                                                name="module"
                                                value={editingCase.module}
                                                className="w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-400"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">
                                            用例名称
                                        </label>
                                        <input
                                            name="name"
                                            defaultValue={editingCase.name}
                                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                                用例等级
                                            </label>
                                            <select
                                                name="level"
                                                defaultValue={editingCase.level}
                                                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
                                                required
                                            >
                                                <option value="P0">P0</option>
                                                <option value="P1">P1</option>
                                                <option value="P2">P2</option>
                                                <option value="P3">P3</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                                用例状态
                                            </label>
                                            <select
                                                name="status"
                                                defaultValue={editingCase.status}
                                                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
                                                required
                                            >
                                                <option value="draft">草稿</option>
                                                <option value="ready">就绪</option>
                                                <option value="testing">测试中</option>
                                                <option value="passed">通过</option>
                                                <option value="failed">失败</option>
                                                <option value="blocked">阻塞</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">
                                            前置条件
                                        </label>
                                        <textarea
                                            name="preconditions"
                                            defaultValue={editingCase.content?.precondition || ''}
                                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 min-h-[80px]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">
                                            测试步骤（每行一个步骤）
                                        </label>
                                        <textarea
                                            name="steps"
                                            defaultValue={editingCase.content?.steps?.join('\n')}
                                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 min-h-[120px]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">
                                            预期结果（每行一个结果）
                                        </label>
                                        <textarea
                                            name="expected"
                                            defaultValue={editingCase.content?.expected?.join('\n')}
                                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 min-h-[120px]"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <Dialog.Close asChild>
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-300"
                                        >
                                            取消
                                        </button>
                                    </Dialog.Close>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className={`btn-gradient rounded-md px-4 py-2 text-sm text-white ${
                                            updating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                                        }`}
                                    >
                                        {updating ? '更新中...' : '确认更新'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );

    useEffect(() => {
        // 初始化时获取任务列表
        fetchTasks();
        
        // 从URL中获取task_id参数
        const urlParams = new URLSearchParams(window.location.search);
        const taskId = urlParams.get('task_id');
        if (taskId) {
            handleTaskChange(taskId);
            // 开始轮询任务状态
            checkTaskStatus(taskId);
        }
    }, []); // 仅在组件挂载时执行一次

    useEffect(() => {
        fetchCases();
    }, [filters]);

    return (
        <div className="space-y-6">
            {/* 筛选和操作栏 - 移动到顶部 */}
            <div className="hover-card glow rounded-lg p-4">
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
                                {projects.map((project) => (
                                    <option key={project} value={project}>
                                        {project}
                                    </option>
                                ))}
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
                    <div className="flex items-center space-x-4">
                        <button
                            className="btn-gradient rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                            onClick={() => {
                                fetchTasks();
                                setTaskDialogOpen(true);
                            }}
                        >
                            <span>选择任务</span>
                        </button>
                        <button 
                            className="btn-gradient rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90 inline-flex items-center space-x-2"
                            onClick={() => setExportDialogOpen(true)}
                        >
                            <Download className="h-4 w-4" />
                            <span>导出用例</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 思维导图区域 */}
            {currentTask && (
                <div className="hover-card glow rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-slate-200">测试用例思维导图</h3>
                    </div>
                    <MindMap 
                        taskId={currentTask} 
                        selectedModules={selectedModules[currentTask] || []}
                    />
                </div>
            )}

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
                            <div className="flex items-center justify-between px-4 mb-4 pb-4 border-b border-slate-700">
                                <div className="flex items-center space-x-4">
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
                                {selectedCases.length > 0 && (
                                    <button 
                                        className="inline-flex items-center space-x-2 rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600"
                                        onClick={handleBatchDelete}
                                    >
                                        <span>删除选中({selectedCases.length})</span>
                                    </button>
                                )}
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
                                                <button
                                                    onClick={() => {
                                                        setEditingCase(testCase);
                                                        setEditDialogOpen(true);
                                                    }}
                                                    className="text-sm text-blue-400 hover:text-blue-300"
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('确定要删除该用例吗？')) {
                                                            handleDeleteCase(testCase.case_id);
                                                        }
                                                    }}
                                                    className="text-sm text-red-400 hover:text-red-300"
                                                >
                                                    删除
                                                </button>
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

            {/* 任务选择对话框 */}
            {renderTaskDialog()}

            {/* 编辑对话框 */}
            {renderEditDialog()}
        </div>
    );
};

export default Cases; 