'use client';

import { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface Node {
  id: string;
  name: string;
  level?: number;
  type?: string;
  val?: number;
}

interface Link {
  source: string;
  target: string;
  type: string;
}

interface KnowledgeGraphVisProps {
  nodes: Node[];
  links: Link[];
  onNodeClick?: (node: any) => void;
}

export default function KnowledgeGraphVis({ nodes: initialNodes, links: initialLinks, onNodeClick }: KnowledgeGraphVisProps) {
  const [graphData, setGraphData] = useState({ nodes: initialNodes, links: initialLinks });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    setGraphData({ nodes: initialNodes, links: initialLinks });
  }, [initialNodes, initialLinks]);
  
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 250
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
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
    if (level === 1) return 15;
    if (level === 2) return 12;
    if (level === 3) return 10;
    return 8;
  };
  
  if (graphData.nodes.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>暂无图谱数据</div>;
  }
  
  return (
    <ForceGraph2D
      graphData={graphData}
      nodeLabel="name"
      nodeColor={getNodeColor}
      nodeVal={getNodeSize}
      linkLabel="type"
      linkDirectionalParticles={1}
      linkDirectionalParticleSpeed={0.005}
      cooldownTicks={100}
      onNodeClick={(node) => {
        if (onNodeClick) {
          onNodeClick(node);
        } else {
          alert(`📖 ${node.name}\n类型: ${node.type || '节点'}\n层级: ${node.level || '?'}`);
        }
      }}
      width={dimensions.width}
      height={dimensions.height}
    />
  );
}
