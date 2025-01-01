import { useState, useEffect } from 'react';
import plantumlEncoder from 'plantuml-encoder';

interface PlantUMLViewerProps {
    code: string;
}

const PlantUMLViewer: React.FC<PlantUMLViewerProps> = ({ code }) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        try {
            // 检查输入的 PlantUML 代码
            if (!code) {
                console.error('PlantUML 代码为空');
                setError('PlantUML 代码为空');
                return;
            }

            console.log('原始 PlantUML 代码:', code);
            
            // 确保代码以 @startmindmap 开头，@endmindmap 结尾
            let processedCode = code.trim();
            if (!processedCode.startsWith('@startmindmap')) {
                console.log('添加 @startmindmap');
                processedCode = '@startmindmap\n' + processedCode;
            }
            if (!processedCode.endsWith('@endmindmap')) {
                console.log('添加 @endmindmap');
                processedCode = processedCode + '\n@endmindmap';
            }
            
            // 检查处理后的代码格式
            if (!processedCode.includes('\n')) {
                console.error('处理后的代码缺少换行符');
                setError('思维导图格式不正确');
                return;
            }
            
            console.log('处理后的 PlantUML 代码:', processedCode);
            
            // 编码 PlantUML 代码
            const encoded = plantumlEncoder.encode(processedCode);
            console.log('编码后的 PlantUML:', encoded);
            
            // 使用正确的路径格式
            const url = `/plantuml/svg/${encoded}`;
            console.log('生成的图片 URL:', url);
            
            // 验证 URL 格式
            if (!encoded || encoded.length < 10) {
                console.error('编码后的 URL 不正确');
                setError('生成思维导图 URL 失败');
                return;
            }
            
            setImageUrl(url);
        } catch (err) {
            console.error('PlantUML 处理失败:', err);
            setError(`生成思维导图失败: ${err.message}`);
        }
    }, [code]);

    if (error) {
        return (
            <div className="error-container p-4 bg-red-500/10 text-red-400 rounded-lg">
                <p>{error}</p>
                <p className="mt-2 text-sm">原始代码: {code}</p>
            </div>
        );
    }

    if (!imageUrl) {
        return (
            <div className="loading-container p-4">
                <p className="text-slate-400">加载中...</p>
            </div>
        );
    }

    return (
        <div className="plantuml-viewer w-full overflow-auto p-5 bg-slate-800 rounded-lg">
            <img 
                src={imageUrl} 
                alt="PlantUML Diagram" 
                className="max-w-full h-auto"
                onError={(e) => {
                    console.error('图片加载失败:', e);
                    setError('加载思维导图失败');
                }}
            />
        </div>
    );
};

export default PlantUMLViewer; 