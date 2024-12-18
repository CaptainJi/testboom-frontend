import { Outlet } from 'react-router-dom';
import { Activity, FileText, List, Home, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
    { name: '首页', href: '/', icon: Home },
    { name: '文件管理', href: '/files', icon: FileText },
    { name: '用例管理', href: '/cases', icon: List },
    { name: '任务管理', href: '/tasks', icon: Activity },
];

const MainLayout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#13111C]">
            <div className="fixed inset-0 pattern-bg" />
            {/* 侧边栏 */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 border-r border-indigo-500/10 bg-[#171522]/50 backdrop-blur-2xl">
                <div className="flex h-16 items-center justify-between px-6">
                    <div className="group flex items-center space-x-2">
                        <div className="relative flex h-8 w-8 items-center justify-center">
                            <div className="absolute inset-0 animate-pulse rounded-lg bg-gradient-to-br from-blue-500/50 to-indigo-500/50 blur-lg transition-all duration-500 group-hover:from-blue-400 group-hover:to-indigo-400" />
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg transition-all duration-300 group-hover:scale-105">
                                <Zap className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold tracking-tight">
                                <span className="text-white transition-colors duration-300 group-hover:text-blue-100">Test</span>
                                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-300 group-hover:to-indigo-300">Boom</span>
                            </h1>
                            <p className="text-[10px] text-slate-400 transition-colors duration-300 group-hover:text-slate-300">AI-Driven Testing</p>
                        </div>
                    </div>
                </div>
                <nav className="mt-4 space-y-1 px-3 py-4">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${isActive
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'text-slate-400 hover:bg-blue-500/5 hover:text-blue-300'
                                    }`}
                            >
                                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* 主内容区 */}
            <div className="relative pl-64">
                <header className="sticky top-0 z-40 h-16 border-b border-indigo-500/10 bg-[#171522]/50 backdrop-blur-2xl">
                    <div className="flex h-full items-center px-6">
                        <h2 className="text-lg font-medium text-slate-200">
                            {navigation.find((item) => item.href === location.pathname)?.name || ''}
                        </h2>
                    </div>
                </header>
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout; 