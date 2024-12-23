import { FileText, Activity, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { statsApi } from '../api/services';
import type { DashboardStats, FileItem, Task } from '../types/api';

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats>({
        total_files: 0,
        total_cases: 0,
        recent_files: 0,
        recent_cases: 0,
        case_stats: {
            by_level: {},
            by_status: {}
        },
        file_stats: {
            by_type: {},
            by_status: {}
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            setLoading(true);
            try {
                const response = await statsApi.getDashboard();
                console.log('Dashboard Response:', response);
                if (response.code === 200) {
                    console.log('Dashboard Data:', response.data);
                    setStats(response.data);
                } else {
                    console.error('获取仪表盘数据失败:', response);
                }
            } catch (error) {
                console.error('获取仪表盘数据出错:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    const statCards = [
        {
            name: '已上传文件',
            value: stats.total_files.toString(),
            icon: FileText,
            description: '成功上传的文件数量',
        },
        {
            name: '生成用例',
            value: stats.total_cases.toString(),
            icon: Activity,
            description: '已生成的测试用例数量',
        },
        {
            name: '最近上传',
            value: stats.recent_files.toString(),
            icon: CheckCircle2,
            description: '最近7天上传的文件数量',
        },
    ];

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <p className="text-sm text-slate-400">加载中...</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {statCards.map((stat) => {
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
                            <h3 className="text-lg font-medium text-slate-200">文件类型统计</h3>
                            <div className="mt-4">
                                {Object.entries(stats.file_stats.by_type).length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(stats.file_stats.by_type).map(([type, count]) => (
                                            <div key={type} className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200">{type}</p>
                                                </div>
                                                <span className="text-xs text-slate-400">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400">暂无数据</p>
                                )}
                            </div>
                        </div>

                        <div className="hover-card glow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-slate-200">文件状态统计</h3>
                            <div className="mt-4">
                                {Object.entries(stats.file_stats.by_status).length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(stats.file_stats.by_status).map(([status, count]) => (
                                            <div key={status} className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200">{status}</p>
                                                </div>
                                                <span className="text-xs text-slate-400">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400">暂无数据</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard; 