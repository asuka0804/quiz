'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BottomNav } from '@/components/BottomNav';
import QuizModal from '@/components/QuizModal';

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
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const processValue = (val: any): any => {
    if (val && typeof val === 'object' && 'low' in val && 'high' in val) return val.low;
    if (val && typeof val === 'object' && typeof val.toNumber === 'function') return val.toNumber();
    return val;
  };

  const getChapterQuery = (chapter: string) => {
    if(chapter === '症状') {
      // 查询所有症状节点及其关联的上层节点（证型、方剂等）
      return `
      MATCH (symptom:节点)-[:属于*]->(root:节点 {name:'症状'})
      WHERE symptom.node_type IN ['分类', '知识点']
      OPTIONAL MATCH (symptom)-[:属于]->(up:节点)
      WHERE up.level <= 4
      OPTIONAL MATCH (symptom)-[:相关]->(f:Formula)
      OPTIONAL MATCH (symptom)-[:相关]->(other:节点)
      RETURN symptom, up, f, other
      LIMIT 300
    `;
  }
  // 原有的章节查询逻辑
    return `MATCH path = (child:节点)-[:属于*]->(root:节点 {name: "${chapter}"}) WHERE child.level >= 2 UNWIND nodes(path) AS n UNWIND relationships(path) AS r RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT {from: id(startNode(r)), to: id(endNode(r)), type: type(r)}) AS relationships`;
  };

  const fetchSymptomsGraph = async () => {
  setLoading(true);
  setError(null);
  setHasData(false);
  try {
    const cypher = `
      MATCH (symptom:节点)-[:属于*]->(root:节点 {name:'症状'})
      WHERE symptom.node_type IN ['分类', '知识点']
      OPTIONAL MATCH (symptom)-[:属于]->(up:节点)
      WHERE up.level <= 4
      OPTIONAL MATCH (symptom)-[:相关]->(f:Formula)
      OPTIONAL MATCH (symptom)-[:相关]->(other:节点)
      RETURN symptom, up, f, other
      LIMIT 300
    `;
    const res = await fetch(`/api/graph?cypher=${encodeURIComponent(cypher)}`);
    const result = await res.json();

    if (result.success && result.data) {
      const nodesMap = new Map();
      const processedNodes: any[] = [];
      const processedLinks: any[] = [];

      result.data.forEach((record: any) => {
        // 处理 symptom 节点
        if (record.symptom && record.symptom.identity !== undefined) {
          const nodeId = String(processValue(record.symptom.identity));
          if (!nodesMap.has(nodeId)) {
            const level = processValue(record.symptom.level);
            const nodeName = record.symptom.name || record.symptom.statement || `节点${nodeId}`;
            processedNodes.push({
              id: nodeId,
              name: nodeName,
              level: level || 3,
              type: '症状',
              val: 12
            });
            nodesMap.set(nodeId, true);
          }
        }
        // 处理 up 节点（证型等）
        if (record.up && record.up.identity !== undefined) {
          const nodeId = String(processValue(record.up.identity));
          if (!nodesMap.has(nodeId)) {
            const level = processValue(record.up.level);
            const nodeName = record.up.name || record.up.statement || `节点${nodeId}`;
            processedNodes.push({
              id: nodeId,
              name: nodeName,
              level: level || 2,
              type: '证型',
              val: 15
            });
            nodesMap.set(nodeId, true);
          }
          // 添加 symptom -> up 的关系
          if (record.symptom && record.symptom.identity) {
            const fromId = String(processValue(record.symptom.identity));
            const toId = nodeId;
            if (fromId && toId) {
              processedLinks.push({ source: fromId, target: toId, type: '属于' });
            }
          }
        }
        // 处理方剂
        if (record.f && record.f.identity !== undefined) {
          const nodeId = String(processValue(record.f.identity));
          if (!nodesMap.has(nodeId)) {
            const nodeName = record.f.name || '方剂';
            processedNodes.push({
              id: nodeId,
              name: nodeName,
              level: 1,
              type: '方剂',
              val: 18
            });
            nodesMap.set(nodeId, true);
          }
          if (record.symptom && record.symptom.identity) {
            const fromId = String(processValue(record.symptom.identity));
            const toId = nodeId;
            if (fromId && toId) {
              processedLinks.push({ source: fromId, target: toId, type: '相关' });
            }
          }
        }
        // 处理 other 关联节点
        if (record.other && record.other.identity !== undefined) {
          const nodeId = String(processValue(record.other.identity));
          if (!nodesMap.has(nodeId)) {
            const level = processValue(record.other.level);
            const nodeName = record.other.name || record.other.statement || `节点${nodeId}`;
            processedNodes.push({
              id: nodeId,
              name: nodeName,
              level: level || 2,
              type: '关联',
              val: 12
            });
            nodesMap.set(nodeId, true);
          }
          if (record.symptom && record.symptom.identity) {
            const fromId = String(processValue(record.symptom.identity));
            const toId = nodeId;
            if (fromId && toId) {
              processedLinks.push({ source: fromId, target: toId, type: '相关' });
            }
          }
        }
      });

      setNodes(processedNodes);
      setLinks(processedLinks);
      setHasData(true);
    } else {
      setError('加载症状图谱失败');
    }
  } catch (err) {
    setError(String(err));
  }
  setLoading(false);
};

  const fetchGraphWithQuery = async (query: string) => {
    setLoading(true);
    setError(null);
    setHasData(false);
    try {
      const res = await fetch(`/api/graph?cypher=${encodeURIComponent(query)}`);
      const result = await res.json();
      if (result.success && result.nodes && result.relationships) {
        setNodes(result.nodes);
        setLinks(result.relationships);
        setHasData(true);
      } else if (result.success && result.data) {
        const nodesMap = new Map();
        const processedNodes: any[] = [];
        const processedLinks: any[] = [];
        result.data.forEach((record: any) => {
          // 处理节点
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
            if (fromId && toId && nodesMap.has(fromId) && nodesMap.has(toId)) {
              processedLinks.push({ source: fromId, target: toId, type: record.r.type || '相关' });
            }
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

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chapter = e.target.value;
    setSelectedChapter(chapter);
    if (chapter === '症状') {
      fetchSymptomsGraph();
  } else {
      const query = getChapterQuery(chapter);
      setCypher(query);
      fetchGraphWithQuery(query);
    }
  };

  const fetchGraph = async () => {
    if (!cypher.trim()) {
      setError('请输入查询语句');
      return;
    }
    await fetchGraphWithQuery(cypher);
  };

  const fetchFullGraph = async () => {
    setLoading(true);
    setError(null);
    setHasData(false);
    try {
      const fullQuery = `MATCH (a)-[r]->(b) RETURN a, {from: id(startNode(r)), to: id(endNode(r)), type: type(r)} as r, b`;
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
              processedLinks.push({ source: fromId, target: toId, type: record.r.type || '相关' });
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

  useEffect(() => {
    const initialQuery = getChapterQuery('辨太阳病脉证并治');
    setCypher(initialQuery);
    fetchGraphWithQuery(initialQuery);
  }, []);

  const fetchQuestionsByNode = async (nodeName: string, count: number = 10) => {
    const res = await fetch('/api/node-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node_name: nodeName, question_count: count, difficulty: 'medium' })
    });
    const data = await res.json();
    return data.questions || [];
  };

  const handleNodeClick = (node: any) => {
    console.log('节点点击回调被触发', node.name);
    const name = node.name;
    if (name) {
      setSelectedNode(name);
      setIsModalOpen(true);
    }
  };

  return (
    <div style={{ padding: '1rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1>📚 伤寒论知识图谱</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select value={selectedChapter} onChange={handleChapterChange} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <option value="症状">💊 症状图谱</option>
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
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'monospace' }}
          placeholder="输入 Cypher 查询..."
        />

        <button onClick={fetchGraph} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>查询</button>
        <button onClick={fetchFullGraph} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}>完整图谱</button>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

      {!hasData && !loading && <div style={{ textAlign: 'center', padding: '4rem' }}>点击"查询"按钮加载知识图谱</div>}
      {loading && <div style={{ textAlign: 'center', padding: '4rem' }}>加载图谱中...</div>}

      {hasData && !loading && (
        <>
          <div style={{ marginBottom: '0.5rem', fontSize: '12px', color: '#666' }}>节点数: {nodes.length} | 关系数: {links.length}</div>
          <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <KnowledgeGraphVis nodes={nodes} links={links} onNodeClick={handleNodeClick} />
          </div>
        </>
      )}

      <QuizModal
        isOpen={isModalOpen}
        nodeName={selectedNode || ''}
        onClose={() => setIsModalOpen(false)}
        fetchQuestions={fetchQuestionsByNode}
      />

      <BottomNav />
    </div>
  );
}
