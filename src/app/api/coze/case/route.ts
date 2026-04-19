import { NextResponse } from "next/server";

const COZE_API_KEY = process.env.COZE_API_KEY;
const BOT_ID = "7628078906033569798"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_message, chat_history = [] } = body;

    console.log("👉 收到前端请求，内容:", user_message);

    // 🚀 使用 Coze V2 同步接口（它会乖乖等到大模型写完所有字才返回）
    const response = await fetch("https://api.coze.cn/open_api/v2/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COZE_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "*/*",
        "Host": "api.coze.cn"
      },
      body: JSON.stringify({
        bot_id: BOT_ID,
        user: "user_" + Math.floor(Math.random() * 10000),
        query: user_message || "新病例",
        chat_history: chat_history, // V2 接口直接支持传入历史记录
        stream: false
      }),
    });

    const data = await response.json();
    
    // 🔍 【全景显微镜】：打印 Coze 到底返回了什么！
    console.log("🤖 Coze 原始返回数据:", JSON.stringify(data, null, 2));

    if (data.code !== 0) {
        console.error("❌ Coze 接口明确报错:", data.msg);
        return NextResponse.json({ error: data.msg }, { status: 500 });
    }

    // 提取回复内容
    const assistantMessage = data.messages?.find((m: any) => m.type === 'answer');
    
    if (assistantMessage && assistantMessage.content) {
       const cleanJsonStr = assistantMessage.content.replace(/```json/g, '').replace(/```/g, '').trim();
       
       try {
           // 尝试按 JSON 解析
           const parsedData = JSON.parse(cleanJsonStr);
           console.log("✅ 成功解析为 JSON，准备发送给前端");
           return NextResponse.json(parsedData);
       } catch (parseError) {
           // 如果大模型返回的不是 JSON（比如大白话），就不会崩溃，而是把大白话包起来发给前端
           console.warn("⚠️ 大模型没有返回标准 JSON，已作为普通文本处理");
           return NextResponse.json({ 
               // 这里的 content 字段可以根据你前端实际读取的字段名调整（比如 message, result 等）
               content: cleanJsonStr, 
               isRawText: true 
           });
       }
    }

    console.warn("⚠️ 没有找到 type='answer' 的消息内容");
    return NextResponse.json({ error: "大模型没有返回有效的答案" }, { status: 500 });

  } catch (error) {
    console.error("🔥 接口内部崩溃，详细原因:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}