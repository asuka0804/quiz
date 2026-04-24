"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation"; // 👈 新增：用于获取路由参数
import { BottomNav } from "@/components/BottomNav";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ChevronLeft, Send, Eye, Hand, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CaseAnalysisPage() {
  const params = useParams(); // 👈 新增：获取当前病症类型
  const type = params.type as string; 

  // --- 🌟 状态管理区 ---
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]); 
  const [apiHistory, setApiHistory] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentCase, setCurrentCase] = useState<any>(null);
  const [progress, setProgress] = useState({ syndrome: false, pathogenesis: false, prescription: false });
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalAnswers, setFinalAnswers] = useState<any>(null);
  
  const [showTongue, setShowTongue] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [score, setScore] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const res = await fetch("/api/coze/case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_message: textToSend,
          chat_history: apiHistory 
        }),
      });
      
      const data = await res.json();

      if (textToSend.includes("新病例") === false) {
        setApiHistory(prev => [...prev, { role: "user", content: textToSend, content_type: "text" }]);
      }
      setApiHistory(prev => [...prev, { role: "assistant", content: JSON.stringify(data), content_type: "text" }]);

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
        setScore(prev => prev + 10);
      }

    } catch (error) {
      console.error("请求失败:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "网络不畅或接口报错，请稍后再试。" }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, apiHistory]);

  // --- 🎯 修改后的初始化逻辑：根据病症出题 ---
  useEffect(() => {
    const typeMap: Record<string, string> = {
      taiyang: "太阳病",
      yangming: "阳明病",
      shaoyang: "少阳病",
      taiyin: "太阴病",
      shaoyin: "少阴病",
      jueyin: "厥阴病"
    };
    const typeName = typeMap[type] || "伤寒杂病";
    
    // 增加“精炼”要求，防止大模型话太多导致 Vercel 10秒超时
    handleSend(`请给我出一个关于【${typeName}】的医案分析题。要求：内容精炼，直接返回JSON格式数据。`); 
  }, [type, handleSend]);

  return (
    <div className="flex min-h-screen flex-col bg-background ancient-texture">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          {/* 👈 修改后的返回按钮：动态跳转 */}
          <Link
            href={`/quiz/${type || 'taiyang'}`}
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

      <main className="flex-1 overflow-auto pb-32 pt-4">
        <div className="mx-auto max-w-lg px-4">
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

              {showTongue && (currentCase.tongue_image || currentCase.tongue_desc) && (
                <div className="mt-4 rounded-lg border border-gold/30 bg
