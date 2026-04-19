'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 动态导入图谱组件，避免 SSR 问题
const KnowledgeGraphVis = dynamic(
  () => import('@/components/KnowledgeGraphVis'),
  { ssr: false, loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>加载图谱中...</div> }
);

export default function KnowledgePage() {
  const [loading, setLoading] = useState(false);
  const [cypher, setCypher] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('辨太阳病脉证并治');
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [hasData, setHasData] = useState(false);

  // 处理 Neo4j 整数格式 {low, high}
  const processValue = (val: any): any => {
    if (val && typeof val === 'object' && 'low' in val && 'high' in val) {
      return val.low;
    }
    if (val && typeof val === 'object' && typeof val.toNumber === 'function') {
      return val.toNumber();
    }
    return val;
  };

  // 生成章节查询语句
  const getChapterQuery = (chapter: string) => {
    return `MATCH path = (child:节点)-[:属于*]->(root:节点 {name: "${chapter}"}) WHERE child.level >= 2 UNWIND nodes(path) AS n UNWIND relationships(path) AS r RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT {from: id(startNode(r)), to: id(endNode(r)), type: type(r)}) AS relationships`;
  };

  // 执行查询
  const fetchGraphWithQuery = async (query: string) => {
    setLoading(true);
    setError(null);
    setHasData(false);
    
    try {
      const res = await fetch(`/api/graph?cypher=${encodeURIComponent(query)}`);
      const result = await res.json();
      
      console.log('API返回数据:', result);
      
      if (result.success && result.nodes && result.relationships) {
        setNodes(result.nodes);
        setLinks(result.relationships);
        setHasData(true);
        console.log('最终结果:', { 节点: result.nodes.length, 关系: result.relationships.length });
        
        if (result.nodes.length === 0) {
          setError('查询无结果');
        }
      } else if (result.success && result.data) {
        const nodesMap = new Map();
        const processedNodes: any[] = [];
        const processedLinks: any[] = [];
        
        result.data.forEach((record: any) => {
          if (record.n && record.n.identity !== undefined) {
            const nodeId = String(processValue(record.n.identity));
            if (!nodesMap.has(nodeId)) {
              const level = processValue(record.n.level);
              const nodeName = record.n.name || record.n.statement || `节点${nodeId}`;
              processedNodes.push({
                id: nodeId,
                name: nodeName,
                level: level || 2,
                type: record.n.labels?.[0] || '节点',
                val: level === 1 ? 15 : level === 2 ? 12 : 10
              });
              nodesMap.set(nodeId, true);
            }
          }
          
          if (record.m && record.m.identity !== undefined) {
            const nodeId = String(processValue(record.m.identity));
            if (!nodesMap.has(nodeId)) {
              const level = processValue(record.m.level);
              const nodeName = record.m.name || record.m.statement || `节点${nodeId}`;
              processedNodes.push({
                id: nodeId,
                name: nodeName,
                level: level || 2,
                type: record.m.labels?.[0] || '节点',
                val: level === 1 ? 15 : level === 2 ? 12 : 10
              });
              nodesMap.set(nodeId, true);
            }
          }
          
          if (record.r && record.r.from !== undefined && record.r.to !== undefined) {
            const fromId = String(processValue(record.r.from));
            const toId = String(processValue(record.r.to));
            const relType = record.r.type || '相关';
            
            if (fromId && toId && nodesMap.has(fromId) && nodesMap.has(toId)) {
              processedLinks.push({
                source: fromId,
                target: toId,
                type: relType
              });
            }
          }
        });
        
        setNodes(processedNodes);
        setLinks(processedLinks);
        setHasData(true);
        console.log('最终结果:', { 节点: processedNodes.length, 关系: processedLinks.length });
        
        if (processedNodes.length === 0) {
          setError('查询无结果');
        }
      } else {
        setError('查询失败');
      }
    } catch (err) {
      setError(String(err));
    }
    setLoading(false);
  };

  // 章节切换
  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chapter = e.target.value;
    setSelectedChapter(chapter);
    const query = getChapterQuery(chapter);
    setCypher(query);
    fetchGraphWithQuery(query);
  };

  // 自定义查询
  const fetchGraph = async () => {
    if (!cypher.trim()) {
      setError('请输入查询语句');
      return;
    }
    await fetchGraphWithQuery(cypher);
  };

  // 完整图谱
  const fetchFullGraph = async () => {
    setLoading(true);
    setError(null);
    setHasData(false);
    
    try {
      const fullQuery = `MATCH (a)-[r]->(b) 
        RETURN a, {from: id(startNode(r)), to: id(endNode(r)), type: type(r)} as r, b`;
      
      const res = await fetch(`/api/graph?cypher=${encodeURIComponent(fullQuery)}`);
      const result = await res.json();
      
      if (result.success && result.data) {
        const nodesMap = new Map();
        const processedNodes: any[] = [];
        const processedLinks: any[] = [];
        
        result.data.forEach((record: any) => {
          if (record.a && record.a.identity !== undefined) {
            const nodeId = String(processValue(record.a.identity));
            if (!nodesMap.has(nodeId)) {
              const level = processValue(record.a.level);
              const nodeName = record.a.name || record.a.statement || `节点${nodeId}`;
              processedNodes.push({
                id: nodeId,
                name: nodeName,
                level: level || 2,
                type: record.a.labels?.[0] || '节点',
                val: level === 1 ? 15 : level === 2 ? 12 : 10
              });
              nodesMap.set(nodeId, true);
            }
          }
          
          if (record.b && record.b.identity !== undefined) {
            const nodeId = String(processValue(record.b.identity));
            if (!nodesMap.has(nodeId)) {
              const level = processValue(record.b.level);
              const nodeName = record.b.name || record.b.statement || `节点${nodeId}`;
              processedNodes.push({
                id: nodeId,
                name: nodeName,
                level: level || 2,
                type: record.b.labels?.[0] || '节点',
                val: level === 1 ? 15 : level === 2 ? 12 : 10
              });
              nodesMap.set(nodeId, true);
            }
          }
          
          if (record.r && record.r.from !== undefined && record.r.to !== undefined) {
            const fromId = String(processValue(record.r.from));
            const toId = String(processValue(record.r.to));
            if (fromId && toId && nodesMap.has(fromId) && nodesMap.has(toId)) {
              processedLinks.push({
                source: fromId,
                target: toId,
                type: record.r.type || '相关'
              });
            }
          }
        });
        
        setNodes(processedNodes);
        setLinks(processedLinks);
        setHasData(true);
      } else {
        setError('加载完整图谱失败');
      }
    } catch (err) {
      setError(String(err));
    }
    setLoading(false);
  };

  // 初始化加载太阳病
  useEffect(() => {
    const initialQuery = getChapterQuery('辨太阳病脉证并治');
    setCypher(initialQuery);
    fetchGraphWithQuery(initialQuery);
  }, []);

  return (
    <div style={{ padding: '1rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ marginBottom: '1rem', color: '#1a1a2e' }}>📚 伤寒论知识图谱</h1>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select
          value={selectedChapter}
          onChange={handleChapterChange}
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
        >
          <option value="辨太阳病脉证并治">🌞 太阳病</option>
          <option value="辨阳明病脉证并治">🔥 阳明病</option>
          <option value="辨少阳病脉证并治">🌀 少阳病</option>
          <option value="辨太阴病脉证并治">📦 太阴病</option>
          <option value="辨少阴病脉证并治">❄️ 少阴病</option>
          <option value="辨厥阴病脉证并治">⚡ 厥阴病</option>
        </select>
        
        <input
          type="text"
          value={cypher}
          onChange={(e) => setCypher(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', minWidth: '200px' }}
          placeholder="输入 Cypher 查询..."
        />
        
        <button
          onClick={fetchGraph}
          style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          查询
        </button>
        
        <button
          onClick={fetchFullGraph}
          style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          完整图谱
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