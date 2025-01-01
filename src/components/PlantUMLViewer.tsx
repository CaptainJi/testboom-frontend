import { useState, useEffect } from 'react';
import plantumlEncoder from 'plantuml-encoder';

interface PlantUMLViewerProps {
    code: string;
}

const PlantUMLViewer: React.FC<PlantUMLViewerProps> = ({ code }) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        try {
            if (!code) {
                console.error('PlantUML 代码为空');
                setError('PlantUML 代码为空');
                return;
            }

            console.log('原始 PlantUML 代码:', code);
            
            let processedCode = code.trim();
            if (!processedCode.startsWith('@startmindmap')) {
                console.log('添加 @startmindmap');
                processedCode = '@startmindmap\n' + processedCode;
            }
            if (!processedCode.endsWith('@endmindmap')) {
                console.log('添加 @endmindmap');
                processedCode = processedCode + '\n@endmindmap';
            }
            
            if (!processedCode.includes('\n')) {
                console.error('处理后的代码缺少换行符');
                setError('思维导图格式不正确');
                return;
            }
            
            console.log('处理后的 PlantUML 代码:', processedCode);
            
            const encoded = plantumlEncoder.encode(processedCode);
            console.log('编码后的 PlantUML:', encoded);
            
            const url = `/plantuml/svg/${encoded}`;
            console.log('生成的图片 URL:', url);
            
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

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newScale = Math.min(Math.max(0.5, scale + delta), 2);
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPosition({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - startPosition.x,
                y: e.clientY - startPosition.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

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
        <div className="plantuml-viewer relative w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl">
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
                <button
                    onClick={() => setScale(prev => Math.min(prev + 0.1, 2))}
                    className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                    +
                </button>
                <button
                    onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}
                    className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                    -
                </button>
                <button
                    onClick={handleReset}
                    className="px-3 py-1 rounded-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
                >
                    重置
                </button>
            </div>
            <div
                className="relative w-full h-[600px] overflow-hidden cursor-move"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    }}
                >
                    <img 
                        src={imageUrl} 
                        alt="PlantUML Diagram" 
                        className="max-w-none filter drop-shadow-lg"
                        style={{
                            transition: 'transform 0.2s ease-out',
                        }}
                        onError={(e) => {
                            console.error('图片加载失败:', e);
                            setError('加载思维导图失败');
                        }}
                    />
                </div>
            </div>
            <div className="absolute bottom-4 left-4 text-sm text-slate-400">
                缩放: {Math.round(scale * 100)}%
            </div>
        </div>
    );
};

export default PlantUMLViewer; 