import { NextResponse } from 'next/server';
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME!,
    process.env.NEO4J_PASSWORD!
  )
);

// 辅助函数：处理 Neo4j 整数类型
function processValue(val: any): any {
  if (val && typeof val === 'object' && val.low !== undefined && val.high !== undefined) {
    return val.low;
  }
  if (val && typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return val;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let cypher = searchParams.get('cypher') || '';
  
  // 如果没有传入查询，使用默认查询（返回太阳病完整树）
  if (!cypher) {
    cypher = `
      MATCH path = (child:节点)-[:属于*]->(root:节点 {name: "辨太阳病脉证并治"})
      WHERE child.level >= 2
      UNWIND nodes(path) AS n
      UNWIND relationships(path) AS r
      RETURN collect(DISTINCT n) AS nodes, 
             collect(DISTINCT {
               from: id(startNode(r)), 
               to: id(endNode(r)), 
               type: type(r)
             }) AS relationships
    `;
  }
  
  const session = driver.session();
  
  try {
    const result = await session.run(cypher);
    
    // 检查是否是我们的太阳病查询（返回 nodes 和 relationships）
    if (result.records.length > 0 && result.records[0].has('nodes') && result.records[0].has('relationships')) {
      const record = result.records[0];
      const nodesRaw = record.get('nodes') || [];
      const relationshipsRaw = record.get('relationships') || [];
      
      // 处理节点数据
      const nodes = nodesRaw.map((node: any) => {
        const identity = processValue(node.identity);
        const level = processValue(node.properties?.level) || processValue(node.level) || 2;
        const nodeName = node.properties?.name || node.name || `节点${identity}`;
        const labels = node.labels || node.properties?.labels || [];
        
        return {
          id: String(identity),
          name: nodeName,
          level: level,
          type: labels[0] || '节点',
          val: level === 1 ? 15 : level === 2 ? 12 : 10
        };
      });
      
      // 处理关系数据
      const relationships = relationshipsRaw.map((rel: any) => ({
        source: String(processValue(rel.from)),
        target: String(processValue(rel.to)),
        type: rel.type || '属于'
      }));
      
      // 去重节点（按 id）
      const uniqueNodes = Array.from(new Map(nodes.map((n: any) => [n.id, n])).values());
      
      return NextResponse.json({ 
        success: true, 
        nodes: uniqueNodes,
        relationships: relationships,
        data: result.records
      });
    }
    
    // 兼容原有查询格式
    const data = result.records.map(record => {
      const obj: any = {};
      record.keys.forEach(key => {
        const value = record.get(key);
        if (value && typeof value === 'object' && value.properties) {
          obj[key] = {
            ...value.properties,
            labels: value.labels,
            identity: processValue(value.identity)
          };
        } else {
          obj[key] = value;
        }
      });
      return obj;
    });
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Neo4j 查询错误:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}