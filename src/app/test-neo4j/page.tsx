'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// 动态导入，避免 SSR 问题
const KnowledgeGraphVis = dynamic(
  () => import('@/components/KnowledgeGraphVis'),
  { ssr: false, loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>加载图谱中...</div> }
);

export default function TestNeo4jPage() {
  const [loading, setLoading] = useState(false);
  const [cypher, setCypher] = useState('MATCH (n) RETURN n LIMIT 100');
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [hasData, setHasData] = useState(false);

  const processValue = (val: any): any => {
    if (val && typeof val === 'object' && 'low' in val && 'high' in val) {
      return val.low;
    }
    return val;
  };

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    setHasData(false);
    
    try {
      // 获取节点
      const nodesRes = await fetch(`/api/graph?cypher=${encodeURIComponent(cypher)}`);
      const nodesResult = await nodesRes.json();
      
      if (!nodesResult.success) {
        setError(nodesResult.error);
        setLoading(false);
        return;
      }
      
      const nodesMap = new Map();
      const processedNodes: any[] = [];
      
      nodesResult.data.forEach((record: any, idx: number) => {
        const node = record.n || record;
        if (node && node.id) {
          const nodeId = String(processValue(node.id));
          if (!nodesMap.has(nodeId)) {
            const newNode = {
              id: nodeId,
              name: node.name || node.statement || `节点${nodeId}`,
              level: processValue(node.level) || 1,
              type: node.node_type || node.labels?.[0] || '节点',
              val: 10
            };
            nodesMap.set(nodeId, newNode);
            processedNodes.push(newNode);
          }
        }
      });
      
      // 获取关系
      const edgesRes = await fetch(`/api/graph?cypher=MATCH (a)-[r]->(b) RETURN a.id as from, type(r) as type, b.id as to LIMIT 200`);
      const edgesResult = await edgesRes.json();
      
      const processedLinks: any[] = [];
      if (edgesResult.success) {
        edgesResult.data.forEach((record: any) => {
          const fromId = String(processValue(record.from));
          const toId = String(processValue(record.to));
          if (fromId && toId && nodesMap.has(fromId) && nodesMap.has(toId)) {
            processedLinks.push({
              source: fromId,
              target: toId,
              type: record.type || '相关'
            });
          }
        });
      }
      
      setNodes(processedNodes);
      setLinks(processedLinks);
      setHasData(true);
      
    } catch (err) {
      setError(String(err));
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '1rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ marginBottom: '1rem', color: '#1a1a2e' }}>📚 伤寒论知识图谱</h1>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={cypher}
          onChange={(e) => setCypher(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}
          placeholder="输入 Cypher 查询..."
        />
        <button
          onClick={fetchGraph}
          style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          查询
        </button>
      </div>
      
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          错误: {error}
        </div>
      )}
      
      {!hasData && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
          <p>点击"查询"按钮加载知识图谱</p>
          <p style={{ fontSize: '12px', marginTop: '1rem' }}>当前默认查询: {cypher}</p>
        </div>
      )}
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          加载图谱中... (节点: {nodes.length}, 关系: {links.length})
        </div>
      )}
      
      {hasData && !loading && (
        <>
          <div style={{ marginBottom: '0.5rem', fontSize: '12px', color: '#666' }}>
            节点数: {nodes.length} | 关系数: {links.length}
          </div>
          <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <KnowledgeGraphVis nodes={nodes} links={links} />
          </div>
        </>
      )}
    </div>
  );
}