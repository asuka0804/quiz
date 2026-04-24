import { NextResponse } from 'next/server';

const COZE_API_KEY = process.env.COZE_API_KEY;
const WORKFLOW_ID = process.env.WORKFLOW_ID;

export async function POST(request: Request) {
  const { node_name, question_count = 10, difficulty = 'medium' } = await request.json();

  if (!node_name) {
    return NextResponse.json({ error: '缺少 node_name' }, { status: 400 });
  }

  if (!COZE_API_KEY || !WORKFLOW_ID) {
    console.error('缺少环境变量 COZE_API_KEY 或 WORKFLOW_ID');
    return NextResponse.json({ error: '服务器配置错误' }, { status: 500 });
  }

  try {
    const res = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: WORKFLOW_ID,
        parameters: {
          node_name: node_name,
          question_type: 'choice',
          question_count: question_count,
          difficulty: difficulty,
          chapter: '',
          user_message: '',
          case_id: ''
        }
      })
    });

    const data = await res.json();

    let questions = [];
    // ✅ 核心修复：data.data 是字符串，需要二次解析
    if (data.data && typeof data.data === 'string') {
      const inner = JSON.parse(data.data);
      questions = inner.questions || [];
    } else if (data.questions) {
      questions = data.questions;
    } else if (data.data?.questions) {
      questions = data.data.questions;
    }

    console.log(`✅ 提取到 ${questions.length} 道题`);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('❌ 调用 Coze 工作流失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
