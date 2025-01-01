import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { caseApi } from '../api/services';
import PlantUMLViewer from './PlantUMLViewer';

interface MindMapProps {
    taskId: string;
}

const MindMap: React.FC<MindMapProps> = ({ taskId }) => {
    const [mindmapCode, setMindmapCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const fetchMindmap = async () => {
            if (!taskId) {
                console.error('taskId 为空');
                setError('任务 ID 不能为空');
                return;
            }
            
            setLoading(true);
            setError(null);
            try {
                // 获取思维导图状态
                console.log('开始获取思维导图状态, taskId:', taskId, '重试次数:', retryCount);
                const response = await caseApi.getPlantUMLStatus(taskId);
                console.log('思维导图状态响应:', JSON.stringify(response, null, 2));
                
                if (response.code === 200) {
                    if (response.data) {
                        console.log('设置思维导图内容');
                        setMindmapCode(response.data);
                        setRetryCount(0); // 重置重试次数
                    } else {
                        console.error('思维导图内容为空');
                        setError('思维导图内容为空');
                        setMindmapCode('');
                        
                        // 如果内容为空，可能还在生成中，继续轮询
                        if (retryCount < 30) {
                            console.log('思维导图生成中，2秒后重试');
                            setRetryCount(prev => prev + 1);
                            setTimeout(() => fetchMindmap(), 2000);
                        } else {
                            console.error('重试次数超过限制');
                            setError('思维导图生成超时');
                            setRetryCount(0);
                        }
                    }
                } else {
                    console.error('获取思维导图失败:', response.message);
                    setError(response.message || '获取思维导图失败');
                    setMindmapCode('');
                    setRetryCount(0); // 重置重试次数
                }
            } catch (err) {
                console.error('获取思维导图失败:', err);
                setError(`获取思维导图失败: ${err.message}`);
                setMindmapCode('');
                setRetryCount(0); // 重置重试次数
            } finally {
                setLoading(false);
            }
        };

        fetchMindmap();
    }, [taskId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <p className="text-sm text-slate-400">
                        正在生成思维导图...{retryCount > 0 ? `(${retryCount}/30)` : ''}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-500/10 p-4 text-red-500">
                <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (!mindmapCode) {
        return null;
    }

    return <PlantUMLViewer code={mindmapCode} />;
};

export default MindMap; 