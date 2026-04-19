import { NextResponse } from 'next/server';

const COZE_API_KEY = process.env.COZE_API_KEY;
const WORKFLOW_ID = '7627318417712939051';

export async function POST(request: Request) {
  const { action, chapter, difficulty, question_count, question_type, excludeIds, questions, userAnswers } = await request.json();

  // 生成题目
  if (action === 'generate') {
    // 🚀 构建给大模型的排除提示
    const excludeHint = excludeIds?.length > 0 
      ? `。请排除以下已出过的题目ID：${excludeIds.join(', ')}，不要重复出这些题` 
      : '';

    let typeHint = '';
    if (question_type === 'fill') {
      typeHint = '。请严格按照《伤寒论》原文出填空题，题干格式为：条文原文，其中需要填空的地方用______代替。选项应为4个候选项，正确答案必须是原文中的原词。不要出临床分析题或推理题。';
    } else if (question_type === 'choice') {
      typeHint = '。请出选择题，题干为临床情景或条文理解，选项为4个，正确答案一个，需要给出详细解析。';
    }

    // 🚀 每次都强制向 Coze 发起真实请求，不再使用本地缓存
    const response = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: WORKFLOW_ID,
        parameters: {
          chapter: chapter,
          difficulty: difficulty || 'medium',
          question_count: question_count || 10,
          question_type: question_type || 'choice',
          // 这里的 extra_hint 终于可以把前方的排除 ID 传给 Coze 了！
          extra_hint: excludeHint + typeHint, 
        },
      }),
    });
    const data = await response.json();
    
    return NextResponse.json(data.data);
  }

  // 判卷
  if (action === 'grade') {
    let score = 0;
    const results = (questions || []).map((q: any) => {
      const userAnswer = userAnswers?.[q.id];
      const isCorrect = userAnswer === q.correct_answer;
      if (isCorrect) score++;
      return {
        id: q.id,
        isCorrect,
        correctAnswer: q.correct_answer,
        explanation: q.explanation || (isCorrect ? '回答正确！' : `正确答案是 ${q.correct_answer}`),
      };
    });
    return NextResponse.json({ score, total: questions?.length || 0, results });
  }

  return NextResponse.json({ error: '无效的 action' }, { status: 400 });
}