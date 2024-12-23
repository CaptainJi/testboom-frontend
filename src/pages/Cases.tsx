import { useState, useEffect } from 'react';
import { Filter, Download } from 'lucide-react';
import { caseApi } from '../api/services';
import type { TestCase } from '../types/api';

const Cases = () => {
    const [cases, setCases] = useState<TestCase[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentTask, setCurrentTask] = useState<string | null>(null);
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

    // 导出用例
    const handleExport = async () => {
        try {
            const response = await caseApi.exportToExcel({
                project_name: filters.project,
                module_name: filters.module,
            });
            // 创建下载链接
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'testcases.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('导出用例失败:', error);
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
                    onClick={handleExport}
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
                        <div className="divide-y divide-slate-700">
                            {cases.map((testCase) => (
                                <div
                                    key={testCase.case_id}
                                    className="flex items-center justify-between py-4 px-4 hover:bg-slate-800/50"
                                >
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-slate-200">{testCase.name}</h4>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {testCase.project} / {testCase.module}
                                        </p>
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
        </div>
    );
};

export default Cases; 