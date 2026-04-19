import { NextResponse } from "next/server";

// ⚠️ 确保你的环境中有 COZE_API_KEY
const COZE_API_KEY = process.env.COZE_API_KEY;

export async function POST(req: Request) {
  try {
    const { text, voice_id } = await req.json();

    // 请求 Coze 的语音合成(TTS)接口
    const response = await fetch("https://api.coze.cn/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COZE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text.substring(0, 1024), // Coze 限制每次合成最多 1024 个字符
        // 这里填入你在 Coze 用的张仲景音色 ID。如果不填，这是一个默认好听的男声 ID
        voice_id: voice_id || "7468512265151741979", 
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Coze TTS 报错:", errorData);
      return NextResponse.json({ error: "合成失败" }, { status: response.status });
    }

    // 🌟 直接将 Coze 返回的真实音频流转发给你的前端网页
    return new Response(response.body, {
      headers: {
        "Content-Type": "audio/wav",
      },
    });
  } catch (error) {
    console.error("TTS 内部错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}