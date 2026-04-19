'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ChevronLeft, CheckCircle, XCircle, ArrowRight, RotateCcw, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// 章节名称映射
const chapterNames: Record<string, string> = {
  taiyang: "辨太阳病脉证并治",
  yangming: "辨阳明病脉证并治",
  shaoyang: "辨少阳病脉证并治",
  taiyin: "辨太阴病脉证并治",
  shaoyin: "辨少阴病脉证并治",
  jueyin: "辨厥阴病脉证并治",
  huoluan: "辨霍乱病脉证并治",
  yangyangyi: "辨阴阳易瘥后劳复病脉证并治",
};

// 题目类型（匹配 Coze 返回格式）
interface CozeQuestion {
  id: number;
  question: string;      // API 返回的是 question，不是 stem
  options: string[];     // API 返回的是字符串数组 ["A. xxx", "B. xxx"]
  correct_answer: string;
  explanation: string;
  source?: string;
}

const QUESTIONS_PER_SET = 10;

export default function ChoiceQuestionPage() {
  const params = useParams();
  const chapter = params.chapter as string;
  const chapterName = chapterNames[chapter] || chapter;

  // ========== UI 状态 ==========
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isZhaned, setIsZhaned] = useState<Record<number, boolean>>({});

  // ========== Coze 数据状态 ==========
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<CozeQuestion[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]);
  const [gradeResult, setGradeResult] = useState<any>(null);

  // ========== 从 Coze 获取题目 ==========
  const fetchQuestions = useCallback(async (excludeIds: number[] = []) => {
    console.log('🔥🔥🔥 fetchQuestions 开始执行 🔥🔥🔥');
    setLoading(true);
    try {
      const res = await fetch("/api/coze/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          chapter: chapterName,
          difficulty: "medium",
          question_count: QUESTIONS_PER_SET,
          excludeIds: excludeIds,
        }),
      });
      
      const result = await res.json();
      
      // 如果 result 是字符串，再解析一次
      let data = result;
      if (typeof result === 'string') {
        console.log('⚠️ result 是字符串，需要二次解析');
        data = JSON.parse(result);
      }
      
      const questionsData = data.questions || [];
      
      console.log('最终题目数量:', questionsData.length);
      
      if (questionsData.length > 0) {
        setAllQuestions(questionsData);
        // 🚀 修复点 1: 加上类型定义 (q: CozeQuestion)，解决 TypeScript 报错
        const newIds = questionsData.map((q: CozeQuestion) => q.id);
        setUsedQuestionIds(prev => [...prev, ...newIds]);
      } else {
        console.error('❌ 无法获取题目');
      }
    } catch (error) {
      console.error("生成题目失败:", error);
    } finally {
      setLoading(false);
    }
  }, [chapterName]);

  // ========== 提交答案并判卷 ==========
  const handleSubmit = async () => {
    if (!allAnswered) return;
    
    const startIdx = currentSetIndex * QUESTIONS_PER_SET;
    const currentQ = allQuestions.slice(startIdx, startIdx + QUESTIONS_PER_SET);
    
    try {
      const res = await fetch("/api/coze/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade",
          chapter: chapterName,
          questions: currentQ,
          userAnswers: answers,
        }),
      });
      const result = await res.json();
      setGradeResult(result);
      setScore(result.score);
      setIsSubmitted(true);
    } catch (error) {
      console.error("判卷失败:", error);
    }
  };

  // ========== 下一页题 (已加载的数据内翻页) ==========
  const handleNextSet = () => {
    // 先清空当前答案和状态
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setGradeResult(null);
    
    // 增加套数索引
    setCurrentSetIndex(prev => prev + 1);
    
    // 延迟滚动，避免 DOM 冲突
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // ========== 获取全新的一套题（带着历史记忆） ==========
  // 🚀 修复点 2: 新增函数，带着做过的题目 ID (usedQuestionIds) 重新去请求，防止重复
  const handleFetchNextSet = () => {
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setGradeResult(null);
    setCurrentSetIndex(0); // 索引归零，因为 allQuestions 会被覆盖
    
    // 把存满的 usedQuestionIds 传过去，让 AI 避开这些题
    fetchQuestions(usedQuestionIds); 
    
    setIsZhaned({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========== 完全重新开始 (清空记忆) ==========
  const handleRestart = () => {
    setCurrentSetIndex(0);
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setGradeResult(null);
    setUsedQuestionIds([]);
    fetchQuestions([]);
    setIsZhaned({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========== 重做当前套 ==========
  const handleRetryCurrentSet = () => {
    // 只重置当前套的答案，不清空题目
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setGradeResult(null);
    
    // 延迟滚动
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // ========== 斩题功能 ==========
  const handleZhan = (questionId: number) => {
    setIsZhaned(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // ========== 选择答案 ==========
  const handleSelectAnswer = (questionId: number, answerKey: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerKey
    }));
  };

  // ========== 初始化 ==========
  useEffect(() => {
    fetchQuestions([]);
  }, [fetchQuestions]);

  // ========== 计算当前套数据 ==========
  const startIndex = currentSetIndex * QUESTIONS_PER_SET;
  const currentQuestions = allQuestions.slice(startIndex, startIndex + QUESTIONS_PER_SET);
  const totalSets = Math.ceil(allQuestions.length / QUESTIONS_PER_SET);
  const hasMoreSets = currentSetIndex < totalSets - 1;
  const allAnswered = currentQuestions.length > 0 && currentQuestions.every(q => answers[q.id] !== undefined);

  // ========== 加载状态 ==========
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-4xl">🤖</div>
          <p className="text-muted-foreground">智能出题中，请稍候...</p>
        </div>
      </div>
    );
  }

  // ========== 无题目状态 ==========
  if (allQuestions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background ancient-texture">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
            <Link href="/quiz" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <span className="font-serif text-sm font-medium">{chapterName}</span>
            <div className="w-9" />
          </div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center px-4">
          <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <h2 className="mb-2 font-serif text-lg font-medium">暂无题目</h2>
          <p className="text-sm text-muted-foreground">该章节题目正在准备中</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  // ========== 主渲染 ==========
  return (
    <div className="flex min-h-screen flex-col bg-background ancient-texture">
      {/* 顶部区域 */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href={`/quiz`} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-medium">{chapterName}</span>
            <span className="text-xs text-muted-foreground">
              第{currentSetIndex + 1}/{totalSets}套
            </span>
          </div>
          {isSubmitted && gradeResult && <ScoreDisplay score={gradeResult.score} compact />}
          {!isSubmitted && <div className="w-9" />}
        </div>
      </header>

      {/* 进度条 */}
      {!isSubmitted && (
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-vermillion transition-all duration-300"
            style={{ 
              width: `${(Object.keys(answers).filter(id => currentQuestions.some(q => q.id === Number(id)))).length / currentQuestions.length * 100}%` 
            }}
          />
        </div>
      )}

      {/* 主内容区 */}
      {!isSubmitted ? (
        <main className="flex-1 space-y-4 px-4 pb-32 pt-6">
          <div className="mb-2 rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              请仔细阅读以下{currentQuestions.length}道题目，选择正确答案后提交
            </p>
          </div>

          {currentQuestions.map((question, qIndex) => (
            <div 
              key={question.id} 
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-vermillion/10 px-3 py-1 text-xs font-medium text-vermillion">
                  第{qIndex + 1}题
                </span>
                <button
                  onClick={() => handleZhan(question.id)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-all",
                    isZhaned[question.id]
                      ? "bg-gold/10 text-gold"
                      : "bg-muted text-muted-foreground hover:bg-gold/10 hover:text-gold"
                  )}
                >
                  {isZhaned[question.id] ? "已斩" : "斩题"}
                </button>
              </div>

              <h3 className="mb-4 font-serif text-sm leading-relaxed">
                {question.question}
              </h3>

              <div className="space-y-2">
                {question.options.map((opt) => {
                  const optKey = opt.charAt(0);
                  const isSelected = answers[question.id] === optKey;
                  return (
                    <button
                      key={optKey}
                      onClick={() => handleSelectAnswer(question.id, optKey)}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all",
                        isSelected
                          ? "border-vermillion bg-vermillion/10"
                          : "border-border hover:border-vermillion/50 hover:bg-muted/50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                          isSelected
                            ? "bg-vermillion text-white"
                            : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
                        )}
                      >
                        {optKey}
                      </span>
                      <span className="flex-1 text-sm">{opt.substring(2)}</span>
                      {isSelected && <CheckCircle className="h-4 w-4 text-vermillion" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </main>
      ) : (
        <main className="flex-1 space-y-4 px-4 pb-32 pt-6">
          <div className="mb-2 rounded-lg bg-jade/10 px-3 py-2">
            <p className="text-xs text-jade">答题完成！查看答案和解析</p>
          </div>

          {currentQuestions.map((question, qIndex) => {
            const userAnswer = answers[question.id];
            const result = gradeResult?.results?.find((r: any) => r.id === question.id);
            const isCorrect = result?.isCorrect || (userAnswer === question.correct_answer);
            const explanation = result?.explanation || question.explanation;
            
            return (
              <div 
                key={question.id} 
                className={cn(
                  "rounded-xl border p-4 shadow-sm",
                  isCorrect 
                    ? "border-jade/30 bg-jade/5" 
                    : "border-vermillion/30 bg-vermillion/5"
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      第{qIndex + 1}题
                    </span>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs text-jade">
                        <CheckCircle className="h-4 w-4" />
                        正确
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-vermillion">
                        <XCircle className="h-4 w-4" />
                        错误
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleZhan(question.id)}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-all",
                      isZhaned[question.id]
                        ? "bg-gold/10 text-gold"
                        : "bg-muted text-muted-foreground hover:bg-gold/10 hover:text-gold"
                    )}
                  >
                    {isZhaned[question.id] ? "已斩" : "斩题"}
                  </button>
                </div>

                <h3 className="mb-4 font-serif text-sm leading-relaxed">
                  {question.question}
                </h3>

                <div className="space-y-2">
                  {question.options.map((opt) => {
                    const optKey = opt.charAt(0);
                    const isSelected = userAnswer === optKey;
                    const isCorrectOption = optKey === question.correct_answer;
                    
                    let optionClass = "border-border bg-card";
                    let icon = null;
                    
                    if (isCorrectOption) {
                      optionClass = "border-jade bg-jade/10";
                      icon = <CheckCircle className="h-4 w-4 text-jade" />;
                    } else if (isSelected && !isCorrectOption) {
                      optionClass = "border-vermillion bg-vermillion/10";
                      icon = <XCircle className="h-4 w-4 text-vermillion" />;
                    }
                    
                    return (
                      <div
                        key={optKey}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-lg border-2 p-3",
                          optionClass
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                            isCorrectOption
                              ? "bg-jade text-white"
                              : isSelected
                              ? "bg-vermillion text-white"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {optKey}
                        </span>
                        <span className="flex-1 text-sm">{opt.substring(2)}</span>
                        {icon}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">答案解析</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </main>
      )}

      {/* 底部操作栏 */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg gap-3">
          {!isSubmitted ? (
            <>
              <button
                onClick={handleRetryCurrentSet}
                disabled={Object.keys(answers).length === 0}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all",
                  Object.keys(answers).length > 0
                    ? "border border-border bg-card hover:bg-muted"
                    : "border border-border bg-muted text-muted-foreground"
                )}
              >
                <RotateCcw className="h-4 w-4" />
                重置
              </button>
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all",
                  allAnswered
                    ? "bg-vermillion text-white hover:bg-vermillion/90"
                    : "bg-muted text-muted-foreground"
                )}
              >
                提交答案
                <span className="text-xs opacity-70">
                  ({Object.keys(answers).filter(id => currentQuestions.some(q => q.id === Number(id))).length}/{currentQuestions.length})
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRetryCurrentSet}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 font-medium transition-all hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" />
                重做本套
              </button>
              
              {/* 🚀 修复点 3: 底部按钮逻辑修正 */}
              {hasMoreSets ? (
                <button
                  onClick={handleNextSet}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90"
                >
                  下一页
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleFetchNextSet}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90"
                >
                  下一套新题
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}