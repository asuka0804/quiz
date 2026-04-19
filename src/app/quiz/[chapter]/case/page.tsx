"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ChevronLeft, Send, Eye, Hand, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CaseAnalysisPage() {
  // --- 🌟 状态管理区 ---
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]); // 界面显示的聊天
  const [apiHistory, setApiHistory] = useState<any[]>([]); // 发给后端的完整上下文
  const [isLoading, setIsLoading] = useState(false);
  
  // 病案相关状态
  const [currentCase, setCurrentCase] = useState<any>(null);
  const [progress, setProgress] = useState({ syndrome: false, pathogenesis: false, prescription: false });
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalAnswers, setFinalAnswers] = useState<any>(null);
  
  // UI 交互状态
  const [showTongue, setShowTongue] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [score, setScore] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isCompleted]);

  // --- 🚀 核心通信逻辑 ---
  const handleSend = useCallback(async (overrideText?: string) => {
    const textToSend = overrideText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    if (!overrideText) {
      setInputMessage("");
      setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    }
    
    setIsLoading(true);

    try {
      // 请求我们新建的专有病案接口
      const res = await fetch("/api/coze/case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_message: textToSend,
          chat_history: apiHistory 
        }),
      });
      
      const data = await res.json();

      // 同步 API 历史记录（用于维持上下文）
      if (textToSend !== "新病例") {
        setApiHistory(prev => [...prev, { role: "user", content: textToSend, content_type: "text" }]);
      }
      setApiHistory(prev => [...prev, { role: "assistant", content: JSON.stringify(data), content_type: "text" }]);

      // 🎯 状态路由：根据 AI 的 action 做出反应
      if (data.action === "new_case") {
        setCurrentCase(data.case_data);
        setMessages([{ role: "assistant", content: data.message }]);
        setProgress({ syndrome: false, pathogenesis: false, prescription: false });
        setIsCompleted(false);
        setFinalAnswers(null);
        setShowPulse(false);
        setShowTongue(false);
      } 
      else if (data.action === "guide") {
        setMessages(prev => [...prev, { role: "assistant", content: data.message, hint: data.hint }]);
        if (data.progress) setProgress(data.progress);
      } 
      else if (data.action === "complete") {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
        setIsCompleted(true);
        setFinalAnswers(data.correct_answers);
        setScore(prev => prev + 10); // 通关加分！
      }

    } catch (error) {
      console.error("请求失败:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "网络不畅或接口报错，请稍后再试。" }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, apiHistory]);

  // 页面初次加载时，自动索要新病例
  useEffect(() => {
    handleSend("新病例");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background ancient-texture">
      {/* 顶部区域 */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link
            href="/quiz/taiyang"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-base font-bold tracking-wide">
            临床医案分析
          </h1>
          <ScoreDisplay score={score} compact />
        </div>
      </header>

      {/* 进度条 (根据 AI 的 progress 动态点亮) */}
      <div className="bg-background/80 border-b border-border py-2 px-4 shadow-sm sticky top-14 z-30">
        <div className="mx-auto max-w-lg flex justify-between text-xs font-medium">
          <span className={cn("flex items-center gap-1 transition-colors", progress.syndrome ? "text-jade" : "text-muted-foreground")}>
            <div className={cn("h-2 w-2 rounded-full", progress.syndrome ? "bg-jade shadow-[0_0_8px_rgba(46,139,87,0.8)]" : "bg-muted")} /> 辨证型
          </span>
          <span className={cn("flex items-center gap-1 transition-colors", progress.pathogenesis ? "text-jade" : "text-muted-foreground")}>
            <div className={cn("h-2 w-2 rounded-full", progress.pathogenesis ? "bg-jade shadow-[0_0_8px_rgba(46,139,87,0.8)]" : "bg-muted")} /> 明病机
          </span>
          <span className={cn("flex items-center gap-1 transition-colors", progress.prescription ? "text-jade" : "text-muted-foreground")}>
            <div className={cn("h-2 w-2 rounded-full", progress.prescription ? "bg-jade shadow-[0_0_8px_rgba(46,139,87,0.8)]" : "bg-muted")} /> 定方药
          </span>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto pb-32 pt-4">
        <div className="mx-auto max-w-lg px-4">
          
          {/* 病案信息卡片 */}
          {currentCase ? (
            <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  {currentCase.title || "仲景医案"}
                </h2>
                <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                  难度：中等
                </span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {currentCase.description}
              </p>

              {/* 舌脉按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTongue(!showTongue)}
                  disabled={!currentCase.tongue_image && !currentCase.tongue_desc}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-all",
                    showTongue ? "border-gold bg-gold/10 text-gold" : "border-border bg-background text-muted-foreground hover:border-gold/50",
                    (!currentCase.tongue_image && !currentCase.tongue_desc) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Eye className="h-4 w-4" /> 查看舌象
                </button>
                <button
                  onClick={() => setShowPulse(!showPulse)}
                  disabled={!currentCase.pulse_image && !currentCase.pulse_desc}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-all",
                    showPulse ? "border-gold bg-gold/10 text-gold" : "border-border bg-background text-muted-foreground hover:border-gold/50",
                    (!currentCase.pulse_image && !currentCase.pulse_desc) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Hand className="h-4 w-4" /> 查看脉象
                </button>
              </div>

              {/* 舌象展示区 */}
              {showTongue && (currentCase.tongue_image || currentCase.tongue_desc) && (
                <div className="mt-4 rounded-lg border border-gold/30 bg-gold/5 p-4 animate-in fade-in slide-in-from-top-2">
                  <p className="mb-2 text-xs font-medium text-gold">舌象记录</p>
                  <div className="rounded-lg bg-background p-3 text-sm text-center text-muted-foreground border border-border">
                    {currentCase.tongue_image ? <img src={currentCase.tongue_image} alt="舌象" className="max-h-32 mx-auto rounded" /> : null}
                    <p className="mt-2">{currentCase.tongue_desc || "舌象特征已包含在题干描述中"}</p>
                  </div>
                </div>
              )}

              {/* 脉象展示区 */}
              {showPulse && (currentCase.pulse_image || currentCase.pulse_desc) && (
                <div className="mt-4 rounded-lg border border-gold/30 bg-gold/5 p-4 animate-in fade-in slide-in-from-top-2">
                  <p className="mb-2 text-xs font-medium text-gold">脉象记录</p>
                  <div className="rounded-lg bg-background p-3 text-sm text-center text-muted-foreground border border-border">
                     {currentCase.pulse_image ? <img src={currentCase.pulse_image} alt="脉象" className="max-h-32 mx-auto rounded" /> : null}
                     <p className="mt-2 font-mono text-primary font-bold text-lg">{currentCase.pulse_desc || "脉象特征已包含在题干描述中"}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
             <div className="mb-6 rounded-xl border border-border bg-card p-8 text-center shadow-sm flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-gold mb-4" />
                <p className="text-muted-foreground font-serif text-sm">正在为您调取医案卷宗...</p>
             </div>
          )}

          {/* 聊天记录 */}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "border border-border bg-card text-foreground rounded-bl-sm"
                  )}
                >
                  {message.content}
                  
                  {/* AI 的 Hint 提示 */}
                  {message.hint && (
                    <div className="mt-3 rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs text-amber-800">
                      <span className="font-bold">💡 仲景提示：</span>{message.hint}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm rounded-bl-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">仲景导师正在斟酌...</span>
                </div>
              </div>
            )}

            {/* 🎉 通关结算卡片 */}
            {isCompleted && finalAnswers && (
              <div className="mt-8 rounded-xl border border-jade/40 bg-[#f4fbf7] p-5 shadow-sm animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-2 mb-4 border-b border-jade/20 pb-3">
                  <CheckCircle className="h-6 w-6 text-jade" />
                  <h3 className="text-lg font-serif font-bold text-jade">通关！仲景亲批处方笺</h3>
                </div>
                <div className="space-y-3 text-sm text-[#2d4a3e]">
                  <p><span className="font-bold opacity-80">【诊断】</span> {finalAnswers.diagnosis}</p>
                  <p><span className="font-bold opacity-80">【病机】</span> {finalAnswers.pathogenesis}</p>
                  <p><span className="font-bold opacity-80">【治法】</span> {finalAnswers.treatment}</p>
                  <p className="pt-2"><span className="font-bold opacity-80 text-base">【方药】</span> <span className="font-serif text-lg text-jade font-bold">{finalAnswers.prescription}</span></p>
                </div>
                <button 
                  onClick={() => { setApiHistory([]); handleSend("新病例"); }}
                  className="mt-5 w-full rounded-lg bg-jade py-2.5 font-bold text-white shadow hover:bg-jade/90 transition-all active:scale-95"
                >
                  挑战下一案
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* 底部输入框 */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isCompleted ? "已通关，请点击挑战下一案" : "输入您的辨证与方药分析..."}
            disabled={isLoading || isCompleted}
            className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputMessage.trim() || isLoading || isCompleted}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
              inputMessage.trim() && !isLoading && !isCompleted
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}