"use client";

import { useState, useRef, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Send, Loader2, Phone, PhoneOff, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// 🌟 终极“净水器”：AI 回复清洗工具函数
const cleanAiMessage = (text: string) => {
  if (!text) return text;

  // 1. 🔪 斩杀数据库执行代码泄露 (类似 tableExecute("...")，通常出现在末尾，直接把后面的全砍掉)
  let cleanedText = text.replace(/tableExecute[\s\S]*/g, '');

  // 2. 🔪 斩杀带有文件名的引用小尾巴 (如：[1] 基础条文_伤寒论.doc)
  cleanedText = cleanedText.replace(/\[\d+(,\s*\d+)*\][^。，！？]*?\.(doc|docx|txt|pdf)/g, '');

  // 3. 🔪 斩杀带括号的独立知识库引用角标 (如：[1] 或 [1, 2])
  cleanedText = cleanedText.replace(/\[\d+(,\s*\d+)*\]/g, '');

  // 4. 🔪 斩杀句末“裸奔”的数字角标（如：宣肺平喘2。 => 宣肺平喘。）
  cleanedText = cleanedText.replace(/(\D)\d+(,\d+)*(?=[。，！？]|$)/g, '$1');

  // 清除替换后可能残留的头尾空白字符
  return cleanedText.trim();
};

export default function RecitePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `「余素闻世人欲习伤寒之学，今得相会，实乃幸事。」\n\n「吾乃张机，字仲景，南阳人士。汝有何疑惑，但说无妨。」`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 通话与录音相关的状态
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // 各种 Ref 引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null); // 用于控制播放的音频

  // 每次消息更新自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🌟 核心播放函数：调用你新建的 TTS 接口播放 Coze 的高级声音
  const speak = async (text: string) => {
    try {
      // 播放新声音前，如果当前有声音在播放，先让它停下
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text }),
      });
      
      if (!response.ok) throw new Error("获取语音失败");
      
      // 拿到后端的音频文件，直接在网页里播放
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      audio.play();
    } catch (error) {
      console.error("播放语音出错:", error);
    }
  };

  // 🌟 核心发消息函数
  const handleSend = async (message?: string) => {
    const text = message || inputMessage.trim();
    if (!text || isLoading) return;

    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    try {
      // 请求大模型回复 (这里是你原本就写好的智能体对话接口)
      const response = await fetch("/api/recite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: text }],
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          assistantMessage += chunk;
          
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === "assistant") {
              return [...prev.slice(0, -1), { ...lastMessage, content: assistantMessage }];
            }
            return [...prev, { role: "assistant", content: assistantMessage }];
          });
        }
        // ✨ 重点：如果是通话模式，播报前先用“净水器”清洗掉代码和标号！
        if (isCallActive) {
          speak(cleanAiMessage(assistantMessage));
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "「惭愧，适才心神不宁，未能作答。」" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 核心录音函数：真正的物理录音机，再也不怕浏览器抽风
  const startRecording = async () => {
    // 录音前，强行打断张仲景的语音播报，防止录到电脑自己的声音
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    try {
      // 唤起麦克风
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsLoading(true);
        setInputMessage("正在把你的语音转为文字...");
        
        // 把录好的声音打包发送给你新建的 /api/asr 接口
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("file", audioBlob);

        try {
          const res = await fetch("/api/asr", { method: "POST", body: formData });
          const data = await res.json();
          
          if (data.text) {
            setInputMessage("");
            // 转字成功，自动发送给张仲景！
            handleSend(data.text);
          } else {
            alert("抱歉，没听清你说的话，请重试。");
            setInputMessage("");
          }
        } catch (err) {
          console.error("语音转文字接口报错:", err);
          alert("语音识别服务开小差了...");
          setInputMessage("");
        } finally {
          setIsLoading(false);
          // 彻底关闭麦克风，去掉浏览器顶部的小红点
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("无法获取麦克风权限，请在浏览器地址栏允许麦克风访问。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); // 停止录音，触发 onstop 事件去转文字
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const toggleCall = () => {
    setIsCallActive(!isCallActive);
    if (!isCallActive) {
      setMessages((prev) => [...prev, { role: "system", content: "「叮——」张仲景接通了您的通话" }]);
      speak("张仲景接通了您的通话。请问有何赐教？");
    } else {
      // 挂断电话时，打断正在说的语音和正在录的音
      if (currentAudioRef.current) currentAudioRef.current.pause();
      if (isRecording) stopRecording();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background ancient-texture">
      {/* 顶部标题栏 */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vermillion/10 text-vermillion font-bold">
              张
            </div>
            <div>
              <h1 className="font-serif text-base font-bold">张仲景</h1>
              <p className="text-xs text-muted-foreground">{isCallActive ? "通话中..." : "随时为您背诵条文"}</p>
            </div>
          </div>
          <button
            onClick={toggleCall}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all",
              isCallActive ? "bg-red-500 text-white animate-pulse" : "bg-jade/10 text-jade"
            )}
          >
            {isCallActive ? <PhoneOff className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* 聊天内容区 */}
      <main className="flex-1 overflow-auto pb-32 pt-4 px-4">
        <div className="mx-auto max-w-lg space-y-4">
          
          {/* 通话状态大头像指示器 */}
          {isCallActive && (
            <div className="flex flex-col items-center py-6 bg-jade/5 rounded-2xl border border-jade/20 animate-in fade-in zoom-in">
              <div className="relative mb-3">
                <div className="h-16 w-16 bg-vermillion/20 rounded-full flex items-center justify-center text-2xl font-serif text-vermillion">
                  机
                </div>
                <div className="absolute -inset-1 border-2 border-vermillion/30 rounded-full animate-ping"></div>
              </div>
              <p className="text-sm text-jade font-medium">张仲景正在倾听...</p>
            </div>
          )}

          {/* 渲染对话气泡 */}
          {messages.map((message, index) => (
            <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              {message.role === "system" ? (
                <div className="w-full text-center text-xs text-muted-foreground py-2">{message.content}</div>
              ) : (
                <div className={cn(
                  "max-w-[85%] p-4 rounded-2xl shadow-sm whitespace-pre-wrap",
                  message.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border rounded-tl-none font-serif text-sm leading-relaxed"
                )}>
                  {/* ✨ 重点：在网页显示文字前，如果是 AI 发的，套上“净水器”清洗一下 */}
                  {message.role === "assistant" ? cleanAiMessage(message.content) : message.content}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 底部输入/录音控制区 */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-background/95 px-4 py-3 backdrop-blur-sm border-t border-border">
        <div className="mx-auto flex max-w-lg gap-2">
          {isCallActive ? (
            <button
              onClick={toggleRecording}
              disabled={isLoading}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-bold shadow-lg active:scale-95 transition-all",
                isRecording ? "bg-red-600 text-white animate-pulse" : "bg-vermillion text-white hover:bg-vermillion/90",
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              <Mic className="h-5 w-5" /> 
              {isRecording ? "正在录音... (点击发送)" : "点击开始说话"}
            </button>
          ) : (
            <>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="向仲景师请教条文..."
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-vermillion"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-vermillion text-white p-2.5 rounded-xl disabled:bg-muted transition-all active:scale-95"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}