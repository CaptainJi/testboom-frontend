import { Download, Filter } from 'lucide-react';

const Cases = () => {
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
                        <select className="rounded-md border bg-background px-3 py-2 text-sm">
                            <option value="">所有项目</option>
                        </select>
                        <select className="rounded-md border bg-background px-3 py-2 text-sm">
                            <option value="">所有模块</option>
                        </select>
                    </div>
                </div>
                <button className="inline-flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    <Download className="h-4 w-4" />
                    <span>导出用例</span>
                </button>
            </div>

            {/* 用例列表 */}
            <div className="rounded-lg border bg-card">
                <div className="p-4">
                    <h3 className="text-lg font-medium">测试用例列表</h3>
                </div>
                <div className="p-4">
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">暂无测试用例</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                请先上传需求文档并生成用例
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 用例统计 */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                    <h4 className="text-sm font-medium text-muted-foreground">总用例数</h4>
                    <p className="mt-2 text-2xl font-bold">0</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <h4 className="text-sm font-medium text-muted-foreground">已导出</h4>
                    <p className="mt-2 text-2xl font-bold">0</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <h4 className="text-sm font-medium text-muted-foreground">生成中</h4>
                    <p className="mt-2 text-2xl font-bold">0</p>
                </div>
            </div>
        </div>
    );
};

export default Cases; 