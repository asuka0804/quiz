"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // 👈 改用 searchParams，兼容性最强
import { BottomNav } from "@/components/BottomNav";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ChevronLeft, Send, Eye, Hand, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// 强制包裹 Suspense 以修复 Next.js 静态编译错误
function CaseAnalysisContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "taiyang"; // 获取 URL 参数中的 type

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

      if (!textToSend.includes("请给我出一个")) {
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
      setMessages(prev => [...prev, { role: "assistant", content: "网络不畅，请稍后再试。" }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, apiHistory]);

  useEffect(() => {
    const typeMap: Record<string, string> = {
      taiyang: "太阳病",
      yangming: "阳明病",
      shaoyang: "少阳病",
      taiyin: "太阴病",
      shaoyin: "少阴病",
      jueyin: "厥阴病"
    };
    const typeName = typeMap[type] || "伤寒";
    handleSend(`请给我出一个关于【${typeName}】的医案分析题。要求内容精炼，直接返回JSON。`); 
  }, [type, handleSend]);

  return (
    <div className="flex min-h-screen flex-col bg-background ancient-texture">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href={`/quiz/${type}`} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-base font-bold tracking-wide">临床医案分析</h1>
          <ScoreDisplay score={score} compact />
        </div>
      </header>

      {/* ... 进度条和主内容区逻辑与之前一致 ... */}
      <div className="bg-background/80 border-b border-border py-2 px-4 shadow-sm sticky top-14 z-30">
        <div className="mx-auto max-w-lg flex justify-between text-xs font-medium">
          <span className={cn("flex items-center gap-1", progress.syndrome ? "text-jade" : "text-muted-foreground")}>
            <div className={cn("h-2 w-2 rounded-full", progress.syndrome ? "bg-jade shadow-[0_0_8px_rgba(46,139,87,0.8)]" : "bg-muted")} /> 辨证型
          </span>
          <span className={cn("flex items-center gap-1", progress.pathogenesis ? "text-jade" : "text-muted-foreground")}>
            <div className={cn("h-2 w-2 rounded-full", progress.pathogenesis ? "bg-jade shadow-[0_0_8px_rgba(46,139,87,0.8)]" : "bg-muted")} /> 明病机
          </span>
          <span className={cn("flex items-center gap-1", progress.prescription ? "text-jade" : "text-muted-foreground")}>
            <div className={cn("h-2 w-2 rounded-full", progress.prescription ? "bg-jade shadow-[0_0_8px_rgba(46,139,87,0.8)]" : "bg-muted")} /> 定方药
          </span>
        </div>
      </div>

      <main className="flex-1 overflow-auto pb-32 pt-4">
        <div className="mx-auto max-w-lg px-4">
          {currentCase ? (
            <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold">{currentCase.title || "仲景医案"}</h2>
                <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">中等难度</span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{currentCase.description}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowTongue(!showTongue)} className={cn("flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium", showTongue ? "border-gold bg-gold/10 text-gold" : "border-border")}>
                  <Eye className="h-4 w-4" /> 查看舌象
                </button>
                <button onClick={() => setShowPulse(!showPulse)} className={cn("flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium", showPulse ? "border-gold bg-gold/10 text-gold" : "border-border")}>
                  <Hand className="h-4 w-4" /> 查看脉象
                </button>
              </div>
              {showTongue && <div className="mt-4 p-4 border border-gold/30 bg-gold/5 rounded-lg text-sm">{currentCase.tongue_desc}</div>}
              {showPulse && <div className="mt-4 p-4 border border-gold/30 bg-gold/5 rounded-lg text-sm font-bold text-primary">{currentCase.pulse_desc}</div>}
            </div>
          ) : (
            <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gold" /><p className="mt-2 text-sm text-muted-foreground">医案加载中...</p></div>
          )}

          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm", m.role === "user" ? "bg-primary text-primary-foreground" : "border border-border bg-card")}>
                  {m.content}
                  {m.hint && <div className="mt-2 p-2 bg-gold/10 border border-gold/20 rounded text-xs text-amber-800">💡 提示：{m.hint}</div>}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-xs text-muted-foreground animate-pulse">仲景正在斟酌...</div>}
            {isCompleted && finalAnswers && (
              <div className="mt-8 rounded-xl border border-jade/40 bg-[#f4fbf7] p-5 shadow-sm">
                <h3 className="text-lg font-bold text-jade mb-3">通关处方</h3>
                <div className="space-y-2 text-sm">
                  <p><b>【诊断】</b> {finalAnswers.diagnosis}</p>
                  <p><b>【方药】</b> <span className="text-jade font-bold">{finalAnswers.prescription}</span></p>
                </div>
                <button onClick={() => { setApiHistory([]); handleSend("新病例"); }} className="mt-4 w-full bg-jade text-white py-2 rounded-lg">挑战下一案</button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-background/95 border-t">
        <div className="mx-auto max-w-lg flex gap-2">
          <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="输入分析..." className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none" />
          <button onClick={() => handleSend()} className="bg-primary text-white p-2 rounded-xl"><Send className="h-5 w-5" /></button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

// 👈 最终导出：必须用 Suspense 包裹，否则 Vercel build 会报错
export default function CaseAnalysisPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <CaseAnalysisContent />
    </Suspense>
  );
}
