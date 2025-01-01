import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface EditableMindMapProps {
    initialData?: string;
    onChange?: (data: { nodes: Node[]; edges: Edge[] }) => void;
}

// 定义不同分支的颜色主题
const colorThemes = [
    {
        primary: '#3b82f6', // 蓝色
        border: 'rgba(59, 130, 246, 0.3)',
        gradient: ['rgba(59, 130, 246, 0.3)', 'rgba(37, 99, 235, 0.2)'],
        shadow: 'rgba(59, 130, 246, 0.2)',
    },
    {
        primary: '#ec4899', // 粉色
        border: 'rgba(236, 72, 153, 0.3)',
        gradient: ['rgba(236, 72, 153, 0.3)', 'rgba(219, 39, 119, 0.2)'],
        shadow: 'rgba(236, 72, 153, 0.2)',
    },
    {
        primary: '#10b981', // 绿色
        border: 'rgba(16, 185, 129, 0.3)',
        gradient: ['rgba(16, 185, 129, 0.3)', 'rgba(5, 150, 105, 0.2)'],
        shadow: 'rgba(16, 185, 129, 0.2)',
    },
    {
        primary: '#f59e0b', // 橙色
        border: 'rgba(245, 158, 11, 0.3)',
        gradient: ['rgba(245, 158, 11, 0.3)', 'rgba(217, 119, 6, 0.2)'],
        shadow: 'rgba(245, 158, 11, 0.2)',
    },
    {
        primary: '#8b5cf6', // 紫色
        border: 'rgba(139, 92, 246, 0.3)',
        gradient: ['rgba(139, 92, 246, 0.3)', 'rgba(124, 58, 237, 0.2)'],
        shadow: 'rgba(139, 92, 246, 0.2)',
    },
    {
        primary: '#06b6d4', // 青色
        border: 'rgba(6, 182, 212, 0.3)',
        gradient: ['rgba(6, 182, 212, 0.3)', 'rgba(8, 145, 178, 0.2)'],
        shadow: 'rgba(6, 182, 212, 0.2)',
    }
];

const getNodeStyle = (colorTheme: typeof colorThemes[0]) => ({
    borderRadius: '16px',
    border: `2px solid ${colorTheme.primary}`,
    padding: '20px 32px',
    color: '#ffffff',
    background: `linear-gradient(135deg, ${colorTheme.primary}80 0%, ${colorTheme.primary}40 100%)`,
    fontSize: '14px',
    fontWeight: '500',
    width: 'auto',
    minWidth: '180px',
    maxWidth: '300px',
    boxShadow: `
        0 0 0 1px ${colorTheme.primary}60,
        0 4px 12px rgba(0, 0, 0, 0.5),
        0 0 20px ${colorTheme.primary}40
    `,
    backdropFilter: 'blur(12px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'grab',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    '&:hover': {
        boxShadow: `
            0 0 0 2px ${colorTheme.primary},
            0 8px 20px rgba(0, 0, 0, 0.6),
            0 0 30px ${colorTheme.primary}60
        `,
        transform: 'translateY(-2px) scale(1.02)',
        borderColor: colorTheme.primary,
        background: `linear-gradient(135deg, ${colorTheme.primary}90 0%, ${colorTheme.primary}60 100%)`,
    },
});

const getEdgeStyle = (colorTheme: typeof colorThemes[0]) => ({
    type: 'smoothstep' as const,
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: colorTheme.primary,
        width: 20,
        height: 20,
    },
    style: {
        stroke: colorTheme.primary,
        strokeWidth: 2,
        opacity: 0.8,
    },
    animated: true,
});

const EditableMindMap: React.FC<EditableMindMapProps> = ({ initialData, onChange }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [branchColors, setBranchColors] = useState<Map<string, typeof colorThemes[0]>>(new Map());

    useEffect(() => {
        if (initialData) {
            try {
                console.log('初始数据:', initialData);
                const lines = initialData.split('\n').filter(line => {
                    const trimmed = line.trim();
                    return trimmed && 
                        !trimmed.startsWith('@startmindmap') && 
                        !trimmed.startsWith('@endmindmap');
                });
                console.log('解析后的行数:', lines.length);
                console.log('解析后的行:', lines);

                const parsedNodes: Node[] = [];
                const parsedEdges: Edge[] = [];
                let nodeId = 1;
                let colorIndex = 0;
                const newBranchColors = new Map<string, typeof colorThemes[0]>();

                const processNode = (line: string, parentId?: string) => {
                    const level = line.match(/^\*+/)?.[0].length || 0;
                    const content = line.replace(/^\*+\s*/, '').trim();
                    const currentId = `node-${nodeId++}`;
                    console.log(`处理节点 ${nodeId-1}: level=${level}, content=${content}, parentId=${parentId}`);

                    const x = level * 350;
                    const y = (nodeId - 1) * 120;

                    let nodeColor;
                    if (level === 0) {
                        nodeColor = colorThemes[0];
                        console.log('根节点颜色:', nodeColor.primary);
                    } else if (level === 1) {
                        nodeColor = colorThemes[colorIndex % colorThemes.length];
                        newBranchColors.set(currentId, nodeColor);
                        colorIndex++;
                        console.log('一级节点颜色:', nodeColor.primary);
                    } else if (parentId) {
                        const parentNode = parsedNodes.find(n => n.id === parentId);
                        if (parentNode) {
                            const parentStyle = parentNode.style as any;
                            const parentColor = colorThemes.find(c => 
                                parentStyle.border?.includes(c.primary) ||
                                parentStyle.background?.includes(c.primary)
                            );
                            nodeColor = parentColor || colorThemes[0];
                            newBranchColors.set(currentId, nodeColor);
                            console.log('子节点继承颜色:', nodeColor.primary);
                        }
                    }

                    const node: Node = {
                        id: currentId,
                        type: 'default',
                        data: { label: content },
                        position: { x, y },
                        sourcePosition: 'right',
                        targetPosition: 'left',
                        style: getNodeStyle(nodeColor || colorThemes[0]),
                    };
                    parsedNodes.push(node);

                    if (parentId) {
                        const edge: Edge = {
                            id: `edge-${parentId}-${currentId}`,
                            source: parentId,
                            target: currentId,
                            ...getEdgeStyle(nodeColor || colorThemes[0]),
                        };
                        parsedEdges.push(edge);
                    }

                    return { id: currentId, level };
                };

                let previousNodes: { id: string; level: number }[] = [];
                lines.forEach((line, index) => {
                    const currentLevel = line.match(/^\*+/)?.[0].length || 0;
                    const parentNode = [...previousNodes].reverse().find(n => n.level < currentLevel);
                    console.log(`第 ${index + 1} 行: currentLevel=${currentLevel}, parentNode=${parentNode?.id}`);
                    const { id, level } = processNode(line, parentNode?.id);
                    previousNodes = previousNodes.filter(n => n.level < currentLevel);
                    previousNodes.push({ id, level });
                });

                console.log('解析完成的节点数:', parsedNodes.length);
                console.log('解析完成的边数:', parsedEdges.length);
                console.log('颜色映射:', Array.from(newBranchColors.entries()));
                
                setBranchColors(newBranchColors);
                setNodes(parsedNodes);
                setEdges(parsedEdges);
            } catch (error) {
                console.error('解析思维导图数据失败:', error);
            }
        }
    }, [initialData]);

    const onConnect = useCallback(
        (params: Connection) => {
            const sourceNode = nodes.find(n => n.id === params.source);
            const sourceColor = sourceNode ? 
                branchColors.get(sourceNode.id) || colorThemes[0] :
                colorThemes[0];
            
            setEdges(eds => addEdge({ ...params, ...getEdgeStyle(sourceColor) }, eds));
        },
        [nodes, branchColors, setEdges]
    );

    useEffect(() => {
        onChange?.({ nodes, edges });
    }, [nodes, edges, onChange]);

    const handleDblClick = useCallback(
        (event: React.MouseEvent, node: Node) => {
            const label = prompt('编辑节点内容:', node.data.label);
            if (label !== null) {
                setNodes(nds =>
                    nds.map(n => {
                        if (n.id === node.id) {
                            return { ...n, data: { ...n.data, label } };
                        }
                        return n;
                    })
                );
            }
        },
        []
    );

    const handlePaneClick = useCallback(
        (event: React.MouseEvent) => {
            if (event.detail === 2) {
                const label = prompt('输入新节点内容:');
                if (label) {
                    const newNode: Node = {
                        id: `node-${Date.now()}`,
                        data: { label },
                        position: {
                            x: event.nativeEvent.offsetX,
                            y: event.nativeEvent.offsetY,
                        },
                        sourcePosition: 'right',
                        targetPosition: 'left',
                        style: getNodeStyle(colorThemes[0]),
                    };
                    setNodes(nds => [...nds, newNode]);
                }
            }
        },
        []
    );

    return (
        <div className="w-full h-[600px] bg-gradient-radial from-slate-800 via-slate-900 to-slate-950 rounded-lg shadow-2xl">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDoubleClick={handleDblClick}
                onPaneClick={handlePaneClick}
                fitView
                attributionPosition="bottom-right"
                minZoom={0.2}
                maxZoom={2}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                className="react-flow-dark"
            >
                <Background 
                    color="#94a3b8" 
                    gap={24} 
                    size={1.5}
                    style={{ 
                        backgroundColor: 'transparent',
                        opacity: 0.08,
                    }}
                />
                <Controls 
                    className="bg-slate-800/90 border-slate-700 rounded-lg backdrop-blur-sm shadow-lg"
                    style={{ 
                        button: { 
                            backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                            border: 'none', 
                            color: '#94a3b8',
                            width: '28px',
                            height: '28px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        },
                        path: { fill: '#94a3b8' }
                    }}
                />
            </ReactFlow>
        </div>
    );
};

export default EditableMindMap; 