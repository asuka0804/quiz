import { NextResponse } from "next/server";

export async function GET() {
  const COZE_API_KEY = process.env.COZE_API_KEY; // 确保你的 .env 里有真实的 Key
  
  try {
    // 直接向 Coze 服务器索要“所有音色列表”
    const response = await fetch("https://api.coze.cn/v1/audio/voices", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${COZE_API_KEY}`,
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "获取音色列表失败" });
  }
}