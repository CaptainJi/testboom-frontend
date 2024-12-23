import { useState, useEffect } from 'react';
import { Filter, Download } from 'lucide-react';
import { caseApi } from '../api/services';
import type { TestCase } from '../types/api';

const Cases = () => {
    const [cases, setCases] = useState<TestCase[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        project: '',
        module: '',
        page: 1,
        page_size: 10
    });

    const fetchCases = async () => {
        setLoading(true);
        try {
            const response = await caseApi.getList(filters);
            console.log('API Response:', response);
            if (response.code === 200 && response.data) {
                console.log('Case List:', response.data);
                setCases(response.data.items);
                setTotal(response.data.total);
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
                                    className="flex items-center justify-between py-4"
                                >
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-200">{testCase.name}</h4>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {testCase.project} / {testCase.module}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-xs text-slate-400">{testCase.level}</span>
                                        <span className="text-xs text-slate-400">{testCase.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 用例计 */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                    <h4 className="text-sm font-medium text-muted-foreground">总用例数</h4>
                    <p className="mt-2 text-2xl font-bold">{cases.length}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <h4 className="text-sm font-medium text-muted-foreground">已导出</h4>
                    <p className="mt-2 text-2xl font-bold">
                        {cases.filter(c => c.status === 'exported').length}
                    </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <h4 className="text-sm font-medium text-muted-foreground">生成中</h4>
                    <p className="mt-2 text-2xl font-bold">
                        {cases.filter(c => c.status === 'generating').length}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Cases; 