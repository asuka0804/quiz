import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. 🎯 终极修正：直接提取前端传来的 messages 数组
    const { messages = [] } = body;

    const COZE_API_KEY = process.env.COZE_API_KEY;
    const BOT_ID = "7511626711813963812"; 

    if (!COZE_API_KEY) {
      console.error("找不到密钥，请检查 .env");
      throw new Error("Missing API Key");
    }

    // 2. 格式化数据：给每条消息加上 Coze 需要的 content_type
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      content_type: "text"
    }));

    // 3. 发送给 Coze
    const response = await fetch("https://api.coze.cn/v3/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COZE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bot_id: BOT_ID,
        user_id: "student_001", // 🔒 固定身份，绝对不能再用随机数，治好它的失忆症！
        stream: true, 
        auto_save_history: false, // 前端已经把历史记录传过来了，这里关掉即可
        additional_messages: formattedMessages
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Coze 报错了:", err);
      throw new Error("请求 Coze 失败");
    }

    // 4. 🤖 智能拆解机器人（防止网页把 JSON 代码打印出来）
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        if (!reader) return;

        let buffer = "";
        let currentEvent = ""; 

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmedLine = line.trim();
              
              if (trimmedLine.startsWith("event:")) {
                currentEvent = trimmedLine.slice(6).trim();
              } 
              else if (trimmedLine.startsWith("data:")) {
                const dataStr = trimmedLine.slice(5).trim();
                if (dataStr === "[DONE]") continue;

                // 只提取文字内容，过滤掉多余的格式
                if (currentEvent === "conversation.message.delta") {
                  try {
                    const dataObj = JSON.parse(dataStr);
                    if (dataObj.type === "answer" && dataObj.content) {
                      controller.enqueue(encoder.encode(dataObj.content));
                    }
                  } catch (e) { /* 忽略解析错误 */ }
                }
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    // 5. 返回纯净的流给前端
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    console.error("API 请求失败:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}