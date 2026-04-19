import { NextResponse } from 'next/server';
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME!,
    process.env.NEO4J_PASSWORD!
  )
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cypher = searchParams.get('cypher') || 'MATCH (n) RETURN n LIMIT 5';
  
  const session = driver.session();
  
  try {
    const result = await session.run(cypher);
    const data = result.records.map(record => {
      const obj: any = {};
      record.keys.forEach(key => {
        const value = record.get(key);
        if (value && typeof value === 'object' && value.properties) {
          obj[key] = {
            ...value.properties,
            labels: value.labels,
            identity: value.identity?.toNumber?.()
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