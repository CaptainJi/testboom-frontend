import { useState, useEffect } from 'react';
import { taskApi } from '../api/services';
import type { Task } from '../types/api';

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
                                    onClick={() => {
                                        setSelectedTask(task);
                                        fetchTaskDetail(task.task_id);
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-200">{task.type}</p>
                                            <p className="text-sm text-slate-400">
                                                {new Date(task.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="text-sm text-slate-400">{task.status}</p>
                                                <p className="text-sm text-slate-400">{task.progress}%</p>
                                            </div>
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
        </div>
    );
};

export default Tasks; 