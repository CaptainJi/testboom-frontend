import { useState, useEffect } from 'react';
import { taskApi } from '../api/services';
import type { Task } from '../types/api';
import { Trash2 } from 'lucide-react';
import { Modal } from '../components/ui/modal';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/use-toast';

const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        page: 1,
        page_size: 10,
    });
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        taskId: string | null;
        deleteCases: boolean;
    }>({
        open: false,
        taskId: null,
        deleteCases: false,
    });

    // 获取任务列表
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskApi.getList(filters);
            if (response.code === 200 && response.data) {
                setTasks(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('获取任务列表失败:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    // 获取任务详情
    const fetchTaskDetail = async (taskId: string) => {
        try {
            const response = await taskApi.getStatus(taskId);
            if (response.code === 200 && response.data) {
                setSelectedTask(response.data);
            }
        } catch (error) {
            console.error('获取任务详情失败:', error);
        }
    };

    // 定期更新任务状态
    useEffect(() => {
        const interval = setInterval(() => {
            if (selectedTask && ['pending', 'processing'].includes(selectedTask.status)) {
                fetchTaskDetail(selectedTask.task_id);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedTask]);

    // 监听筛选条件变化
    useEffect(() => {
        fetchTasks();
    }, [filters]);

    // 获取任务状态的中文描述
    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            'pending': '等待中',
            'processing': '进行中',
            'completed': '已完成',
            'failed': '失败'
        };
        return statusMap[status] || status;
    };

    // 删除任务
    const handleDeleteTask = async () => {
        if (!deleteDialog.taskId) return;
        
        try {
            const response = await taskApi.deleteTask(deleteDialog.taskId, deleteDialog.deleteCases);
            if (response.code === 200) {
                toast({
                    title: "删除成功",
                    description: "任务已成功删除",
                });
                // 重置筛选条件
                setFilters(prev => ({
                    ...prev,
                    type: '',
                    status: '',
                }));
                // 刷新任务列表
                fetchTasks();
                // 如果删除的是当前选中的任务，清空选中状态
                if (selectedTask?.task_id === deleteDialog.taskId) {
                    setSelectedTask(null);
                }
            }
        } catch (error) {
            console.error('删除任务失败:', error);
            toast({
                title: "删除失败",
                description: "删除任务时发生错误",
                variant: "destructive",
            });
        } finally {
            setDeleteDialog({ open: false, taskId: null, deleteCases: false });
        }
    };

    return (
        <div className="space-y-6">
            {/* 任务列表 */}
            <div className="rounded-lg border bg-card">
                <div className="flex items-center justify-between p-4">
                    <h3 className="text-lg font-medium">任务列表</h3>
                    <div className="flex items-center space-x-2">
                        <select 
                            className="rounded-md border bg-background px-3 py-2 text-sm"
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        >
                            <option value="">所有类型</option>
                            <option value="generate">生成用例</option>
                            <option value="export">导出用例</option>
                        </select>
                        <select 
                            className="rounded-md border bg-background px-3 py-2 text-sm"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="">所有状态</option>
                            <option value="pending">等待中</option>
                            <option value="processing">进行中</option>
                            <option value="completed">已完成</option>
                            <option value="failed">失败</option>
                        </select>
                    </div>
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-sm text-muted-foreground">加载中...</p>
                        </div>
                    ) : tasks.length > 0 ? (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div 
                                    key={task.task_id} 
                                    className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                                        selectedTask?.task_id === task.task_id 
                                            ? 'border-blue-500 bg-blue-500/5' 
                                            : 'hover:border-blue-500/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1" onClick={() => {
                                            setSelectedTask(task);
                                            fetchTaskDetail(task.task_id);
                                        }}>
                                            <p className="font-medium text-slate-200">
                                                {task.result?.project_name || '未知项目'}
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                {new Date(task.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className={`px-2 py-1 text-xs rounded-full ${
                                                    task.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                    task.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                                                    task.status === 'processing' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                    {getStatusText(task.status)}
                                                </div>
                                                {task.status === 'processing' && (
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {task.progress}%
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteDialog({
                                                        open: true,
                                                        taskId: task.task_id,
                                                        deleteCases: false,
                                                    });
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">暂无任务</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 任务详情 */}
            <div className="rounded-lg border bg-card p-4">
                <h3 className="text-lg font-medium">任务详情</h3>
                <div className="mt-4">
                    {selectedTask ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-400">任务ID</p>
                                    <p className="text-sm text-slate-200">{selectedTask.task_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">任务类型</p>
                                    <p className="text-sm text-slate-200">{selectedTask.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">创建时间</p>
                                    <p className="text-sm text-slate-200">
                                        {new Date(selectedTask.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">更新时间</p>
                                    <p className="text-sm text-slate-200">
                                        {new Date(selectedTask.updated_at).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">状态</p>
                                    <p className="text-sm text-slate-200">{selectedTask.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">进度</p>
                                    <p className="text-sm text-slate-200">{selectedTask.progress}%</p>
                                </div>
                            </div>
                            {selectedTask.error && (
                                <div>
                                    <p className="text-sm text-slate-400">错误信息</p>
                                    <p className="text-sm text-red-400">{selectedTask.error}</p>
                                </div>
                            )}
                            {selectedTask.result && (
                                <div>
                                    <p className="text-sm text-slate-400">结果</p>
                                    <pre className="mt-2 rounded bg-slate-900 p-4 text-sm text-slate-200">
                                        {JSON.stringify(selectedTask.result, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">选择任务查看详情</p>
                    )}
                </div>
            </div>

            {/* 删除确认对话框 */}
            <Modal
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog(prev => ({ ...prev, open: false }))}
                title="删除任务"
                footer={
                    <>
                        <button
                            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-300"
                            onClick={() => setDeleteDialog({ open: false, taskId: null, deleteCases: false })}
                        >
                            取消
                        </button>
                        <button
                            className="btn-gradient rounded-md px-4 py-2 text-sm text-white hover:opacity-90"
                            onClick={handleDeleteTask}
                        >
                            删除
                        </button>
                    </>
                }
            >
                <div className="py-4">
                    <p className="text-sm text-slate-200 mb-4">确定要删除这个任务吗？此操作不可恢复。</p>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={deleteDialog.deleteCases}
                            onChange={(e) => setDeleteDialog(prev => ({
                                ...prev,
                                deleteCases: e.target.checked
                            }))}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="text-sm text-slate-200">同时删除关联的测试用例</span>
                    </label>
                </div>
            </Modal>
        </div>
    );
};

export default Tasks; 