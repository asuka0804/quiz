'use client';

import { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function KnowledgeGraphVis({ nodes: initialNodes, links: initialLinks }: { nodes: any[]; links: any[] }) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: Math.max(400, window.innerWidth - 100),
        height: Math.max(400, window.innerHeight - 250)
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // 🔥 添加调试：打印第一个节点
  console.log('KnowledgeGraphVis 接收到的节点:', initialNodes.slice(0, 3));
  
  const getNodeColor = (node: any) => {
    const level = node.level;
    if (level === 1) return '#FF6B6B';
    if (level === 2) return '#4ECDC4';
    if (level === 3) return '#45B7D1';
    if (level === 4) return '#96CEB4';
    if (level === 5) return '#FFEAA7';
    return '#DFE6E9';
  };
  
  const getNodeSize = (node: any) => {
    const level = node.level;
    if (level === 1) return 20;
    if (level === 2) return 16;
    if (level === 3) return 12;
    return 10;
  };
  
  // 处理数据
  const processedNodes = initialNodes.map((node: any) => ({
    ...node,
    id: String(node.id),
    name: node.name || '未知',  // 🔥 确保有 name
    label: node.name || '未知',
    val: getNodeSize(node)
  }));
  
  const processedLinks = initialLinks.map((link: any) => ({
    source: String(link.source),
    target: String(link.target),
    label: link.type || '相关'
  }));
  
  const graphData = {
    nodes: processedNodes,
    links: processedLinks
  };
  
  if (graphData.nodes.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>暂无图谱数据</div>;
  }
  
  return (
    <ForceGraph2D
      graphData={graphData}
      nodeLabel="name"
      nodeColor={getNodeColor}
      nodeVal="val"
      linkLabel="label"
      linkDirectionalParticles={1}
      cooldownTicks={100}
      onNodeClick={(node) => {
        alert(`📖 ${node.name}\n类型: ${node.type || '节点'}\n层级: ${node.level || '?'}`);
      }}
      width={dimensions.width}
      height={dimensions.height}
    />
  );
}