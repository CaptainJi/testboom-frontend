import { FileText, Activity, CheckCircle2 } from 'lucide-react';

const stats = [
    {
        name: '已上传文件',
        value: '0',
        icon: FileText,
        description: '成功上传的文件数量',
    },
    {
        name: '生成用例',
        value: '0',
        icon: Activity,
        description: '已生成的测试用例数量',
    },
    {
        name: '完成任务',
        value: '0',
        icon: CheckCircle2,
        description: '已完成的任务数量',
    },
];

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.name}
                            className="hover-card glow rounded-lg p-6"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="rounded-full bg-blue-500/10 p-3">
                                    <Icon className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                                    <h3 className="text-2xl font-bold text-slate-200 neon-text">{stat.value}</h3>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-slate-400">{stat.description}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="hover-card glow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-slate-200">最近上传</h3>
                    <div className="mt-4">
                        <p className="text-sm text-slate-400">暂无数据</p>
                    </div>
                </div>

                <div className="hover-card glow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-slate-200">最近任务</h3>
                    <div className="mt-4">
                        <p className="text-sm text-slate-400">暂无数据</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 