import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "没有找到音频文件" }, { status: 400 });
    }

    // 🌟 1. 填入你刚刚在硅基流动申请的真实 API Key
    const ASR_API_KEY = "sk-meesohlshwwfqbtpxusrhweedgbnsrhvdbmlgschmpzoqnek"; 
    
    // 🌟 2. 硅基流动的国内直连 API 地址
    const ASR_API_URL = "https://api.siliconflow.cn/v1/audio/transcriptions";

    const apiFormData = new FormData();
    // 必须告诉后端这是一个 webm 音频文件
    apiFormData.append("file", file, "audio.webm"); 
    // 🌟 3. 使用阿里开源的 SenseVoice 语音小模型（极速、免费）
    apiFormData.append("model", "FunAudioLLM/SenseVoiceSmall");

    const response = await fetch(ASR_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ASR_API_KEY}`,
      },
      body: apiFormData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API 响应失败:", errorData);
      throw new Error(`API error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error("ASR 内部错误:", error);
    return NextResponse.json({ error: "语音识别失败" }, { status: 500 });
  }
}