import { Clock, CheckCircle, XCircle } from 'lucide-react';

const Tasks = () => {
    return (
        <div className="space-y-6">
            {/* 任务统计 */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <h4 className="text-sm font-medium text-muted-foreground">进行中</h4>
                    </div>
                    <p className="mt-2 text-2xl font-bold">0</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h4 className="text-sm font-medium text-muted-foreground">已完成</h4>
                    </div>
                    <p className="mt-2 text-2xl font-bold">0</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center space-x-3">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <h4 className="text-sm font-medium text-muted-foreground">失败</h4>
                    </div>
                    <p className="mt-2 text-2xl font-bold">0</p>
                </div>
            </div>

            {/* 任务列表 */}
            <div className="rounded-lg border bg-card">
                <div className="flex items-center justify-between p-4">
                    <h3 className="text-lg font-medium">任务列表</h3>
                    <div className="flex items-center space-x-2">
                        <select className="rounded-md border bg-background px-3 py-2 text-sm">
                            <option value="">所有类型</option>
                            <option value="generate">生成用例</option>
                            <option value="export">导出用例</option>
                        </select>
                        <select className="rounded-md border bg-background px-3 py-2 text-sm">
                            <option value="">所有状态</option>
                            <option value="running">进行中</option>
                            <option value="completed">已完成</option>
                            <option value="failed">失败</option>
                        </select>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">暂无任务</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 任务详情 */}
            <div className="rounded-lg border bg-card p-4">
                <h3 className="text-lg font-medium">任务详情</h3>
                <div className="mt-4">
                    <p className="text-sm text-muted-foreground">选择任务查看详情</p>
                </div>
            </div>
        </div>
    );
};

export default Tasks; 