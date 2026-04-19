'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { BottomNav } from '@/components/BottomNav';

// 动态导入图谱组件，避免 SSR 问题
const KnowledgeGraphVis = dynamic(
  () => import('@/components/KnowledgeGraphVis'),
  { ssr: false, loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>加载图谱中...</div> }
);

export default function KnowledgePage() {
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');  // 新增：搜索关键词
  const [cypher, setCypher] = useState('MATCH (n) RETURN n LIMIT 100');
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [hasData, setHasData] = useState(false);
  const [searchMode, setSearchMode] = useState<'full' | 'search'>('full'); // 新增：模式切换

  // 处理 Neo4j 整数格式 {low, high}
  const processValue = (val: any): any => {
    if (val && typeof val === 'object' && 'low' in val && 'high' in val) {
      return val.low;
    }
    return val;
  };

  // 根据关键词自动构建查询
  const buildSearchQuery = (keyword: string) => {
    if (!keyword.trim()) {
      return 'MATCH (n) RETURN n LIMIT 100';
    }
    
    // 构建模糊搜索查询：搜索节点名称或条文内容包含关键词
    return `
      // 找到包含关键词的节点
      MATCH (n)
      WHERE n.name CONTAINS '${keyword}' 
         OR n.statement CONTAINS '${keyword}'
      WITH collect(n) as matchedNodes
      
      // 找到这些节点的相关节点（1-2度关系）
      MATCH (a)-[r]-(b)
      WHERE a IN matchedNodes OR b IN matchedNodes
      RETURN a, r, b
      LIMIT 150
    `;
  };

  // 执行搜索
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      alert('请输入搜索关键词，如：太阳病、桂枝汤');
      return;
    }
    
    setLoading(true);
    setError(null);
    setHasData(false);
    
    try {
      const searchQuery = buildSearchQuery(searchKeyword);
      const res = await fetch(`/api/graph?cypher=${encodeURIComponent(searchQuery)}`);
      const result = await res.json();
      
      if (result.success && result.data) {
        const nodesMap = new Map();
        const processedNodes: any[] = [];
        const processedLinks: any[] = [];
        
        result.data.forEach((record: any) => {
          // 处理节点 a
          if (record.a && record.a.identity) {
            const nodeId = String(processValue(record.a.identity));
            if (!nodesMap.has(nodeId)) {
              const level = processValue(record.a.properties?.level);
              processedNodes.push({
                id: nodeId,
                name: record.a.properties?.name || record.a.properties?.statement || `节点${nodeId}`,
                level: level || 2,
                type: record.a.labels?.[0] || '节点',
                val: level === 1 ? 15 : level === 2 ? 12 : 10
              });
              nodesMap.set(nodeId, true);
            }
          }
          
          // 处理节点 b
          if (record.b && record.b.identity) {
            const nodeId = String(processValue(record.b.identity));
            if (!nodesMap.has(nodeId)) {
              const level = processValue(record.b.properties?.level);
              processedNodes.push({
                id: nodeId,
                name: record.b.properties?.name || record.b.properties?.statement || `节点${nodeId}`,
                level: level || 2,
                type: record.b.labels?.[0] || '节点',
                val: level === 1 ? 15 : level === 2 ? 12 : 10
              });
              nodesMap.set(nodeId, true);
            }
          }
          
          // 处理关系
          if (record.r) {
            const fromId = String(processValue(record.r.start));
            const toId = String(processValue(record.r.end));
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
        
        if (processedNodes.length === 0) {
          setError(`未找到与"${searchKeyword}"相关的内容`);
        }
      } else {
        setError('查询失败');
      }
    } catch (err) {
      setError(String(err));
    }
    setLoading(false);
  };

  // 原有的完整图谱查询
  const fetchFullGraph = async () => {
    setLoading(true);
    setError(null);
    setHasData(false);
    
    try {
      const fullQuery = `
        MATCH (n)
        WITH collect(n) as nodes
        MATCH (a)-[r]->(b)
        RETURN nodes, collect({from: id(a), to: id(b), type: type(r)}) as relationships
      `;
      
      const res = await fetch(`/api/graph?cypher=${encodeURIComponent(fullQuery)}`);
      const result = await res.json();
      
      if (result.success && result.data[0]) {
        const nodesData = result.data[0].nodes || [];
        const relationships = result.data[0].relationships || [];
        
        const nodesMap = new Map();
        const processedNodes: any[] = [];
        
        nodesData.forEach((node: any) => {
          if (node && node.identity) {
            const nodeId = String(processValue(node.identity));
            if (!nodesMap.has(nodeId)) {
              const level = processValue(node.properties?.level);
              processedNodes.push({
                id: nodeId,
                name: node.properties?.name || node.properties?.statement || `节点${nodeId}`,
                level: level || 1,
                type: node.labels?.[0] || '节点',
                val: level === 1 ? 15 : level === 2 ? 12 : 10
              });
              nodesMap.set(nodeId, true);
            }
          }
        });
        
        const processedLinks: any[] = [];
        relationships.forEach((rel: any) => {
          const fromId = String(processValue(rel.from));
          const toId = String(processValue(rel.to));
          if (fromId && toId && nodesMap.has(fromId) && nodesMap.has(toId)) {
            processedLinks.push({
              source: fromId,
              target: toId,
              type: rel.type || '相关'
            });
          }
        });
        
        setNodes(processedNodes);
        setLinks(processedLinks);
        setHasData(true);
      } else {
        setError('查询失败');
      }
    } catch (err) {
      setError(String(err));
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '1rem', height: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>
      <h1 style={{ marginBottom: '1rem', color: '#1a1a2e' }}>📚 伤寒论知识图谱</h1>
      
      {/* 搜索区域 */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
            placeholder="🔍 输入关键词搜索，如：太阳病、桂枝汤、麻黄汤..."
          />
          <button
            onClick={handleSearch}
            style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            搜索
          </button>
          <button
            onClick={fetchFullGraph}
            style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            完整图谱
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={cypher}
            onChange={(e) => setCypher(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}
            placeholder="或直接输入 Cypher 查询..."
          />
          <button
            onClick={async () => {
              setLoading(true);
              setError(null);
              setHasData(false);
              try {
                const res = await fetch(`/api/graph?cypher=${encodeURIComponent(cypher)}`);
                const result = await res.json();
                if (result.success && result.data) {
                  const nodesMap = new Map();
                  const processedNodes: any[] = [];
                  const processedLinks: any[] = [];
                  
                  result.data.forEach((record: any) => {
                    Object.values(record).forEach((value: any) => {
                      if (value && value.identity && !nodesMap.has(String(processValue(value.identity)))) {
                        const nodeId = String(processValue(value.identity));
                        const level = processValue(value.properties?.level);
                        processedNodes.push({
                          id: nodeId,
                          name: value.properties?.name || value.properties?.statement || `节点${nodeId}`,
                          level: level || 2,
                          type: value.labels?.[0] || '节点',
                          val: level === 1 ? 15 : level === 2 ? 12 : 10
                        });
                        nodesMap.set(nodeId, true);
                      }
                    });
                    
                    if (record.r) {
                      const fromId = String(processValue(record.r.start));
                      const toId = String(processValue(record.r.end));
                      processedLinks.push({
                        source: fromId,
                        target: toId,
                        type: record.r.type || '相关'
                      });
                    }
                  });
                  
                  setNodes(processedNodes);
                  setLinks(processedLinks);
                  setHasData(true);
                } else {
                  setError('查询失败');
                }
              } catch (err) {
                setError(String(err));
              }
              setLoading(false);
            }}
            style={{ padding: '0.5rem 1rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            执行Cypher
          </button>
        </div>
      </div>
      
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          错误: {error}
        </div>
      )}
      
      {!hasData && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
          <p>🔍 在搜索框输入关键词，如：<strong style={{ cursor: 'pointer' }} onClick={() => setSearchKeyword('太阳病')}>太阳病</strong>、<strong style={{ cursor: 'pointer' }} onClick={() => setSearchKeyword('桂枝汤')}>桂枝汤</strong>、<strong style={{ cursor: 'pointer' }} onClick={() => setSearchKeyword('少阳病')}>少阳病</strong></p>
          <p style={{ fontSize: '12px', marginTop: '1rem' }}>或点击"完整图谱"查看全部数据</p>
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
      
      <BottomNav />
    </div>
  );
}