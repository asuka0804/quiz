'use client';

import dynamic from 'next/dynamic';

// 动态导入，避免 SSR 问题
const KnowledgeGraph = dynamic(
  () => import('@/components/KnowledgeGraphVis'),
  { ssr: false }
);

export default function GraphTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">知识图谱展示</h1>
      <p className="text-gray-600 mb-4">
        等待配置 Neo4j 连接信息后即可显示图谱数据
      </p>
      <KnowledgeGraph />
    </div>
  );
}