import { NextResponse } from "next/server";

const COZE_API_KEY = process.env.COZE_API_KEY;
// ⚠️ 记得换成你同学“条文背诵”智能体的真实 ID
const BOT_ID = "7511626711813963812"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_message, chat_history = [] } = body;

    const messages = [
      ...chat_history,
      { role: "user", content: user_message, content_type: "text" }
    ];

    const response = await fetch("https://api.coze.cn/v3/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COZE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bot_id: BOT_ID,
        user_id: "user_" + Math.floor(Math.random() * 10000),
        stream: true, // 🚀 关键：开启流式传输
        auto_save_history: false,
        additional_messages: messages
      }),
    });

    if (!response.ok) {
      throw new Error("请求 Coze 失败");
    }

    // 将 Coze 的数据流直接透传（打通）给前端
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("API 请求失败:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}