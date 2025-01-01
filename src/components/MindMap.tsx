import { useEffect, useState } from 'react';
import { caseApi } from '../api/services';
import { AlertCircle } from 'lucide-react';

interface MindMapProps {
    taskId: string | null;
}

const MindMap = ({ taskId }: MindMapProps) => {
    const [mindmapSvg, setMindmapSvg] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMindmap = async () => {
            if (!taskId) return;
            
            setLoading(true);
            setError(null);
            try {
                // 获取思维导图状态
                const statusResponse = await caseApi.getPlantUMLStatus(taskId);
                console.log('思维导图状态:', statusResponse);
                
                if (statusResponse.code === 200 && statusResponse.data) {
                    if (statusResponse.data.status === 'success') {
                        // 如果状态成功，直接使用状态接口返回的思维导图内容
                        if (statusResponse.data.mindmap) {
                            setMindmapSvg(statusResponse.data.mindmap);
                        } else {
                            setError('思维导图内容为空');
                        }
                    } else if (statusResponse.data.status === 'failed') {
                        setError(statusResponse.data.message || '思维导图生成失败');
                    } else {
                        // 如果还在生成中，继续轮询
                        setTimeout(() => fetchMindmap(), 2000);
                    }
                } else {
                    setError('获取思维导图状态失败');
                }
            } catch (err) {
                setError('获取思维导图失败');
                console.error('获取思维导图失败:', err);
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
                    <p className="text-sm text-slate-400">正在加载思维导图...</p>
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

    if (!mindmapSvg) {
        return null;
    }

    return (
        <div className="w-full overflow-x-auto">
            <pre className="text-sm text-slate-200 whitespace-pre-wrap">
                {mindmapSvg}
            </pre>
        </div>
    );
};

export default MindMap; 