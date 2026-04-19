"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ChevronLeft, CheckCircle, XCircle, RotateCcw, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface FillQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  source?: string;
  fullText?: string;
}

const BATCH_SIZE = 5;

export default function FillQuestionPage() {
  const params = useParams();
  const chapter = params.chapter as string;
  const chapterName = chapterNames[chapter] || chapter;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<"unanswered" | "correct" | "wrong">("unanswered");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<FillQuestion[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]);
  // 🚀 新增：专门记录已经出过题的正确答案，用来防重复！
  const [usedAnswersHistory, setUsedAnswersHistory] = useState<string[]>([]);

  // 🚀 修改：把历史答案数组作为参数传进来
  const fetchBatch = useCallback(async (excludeIds: number[] = [], historyAnswers: string[] = []) => {
    setLoading(true);
    try {
      // 🚀 核心魔法：把前面积累的历史答案变成字符串（最多取最近15个，防太长）
      const recentUsed = historyAnswers.slice(-15).join("、");
      
      // 🚀 核心魔法：劫持 difficulty 字段，把排重警告直接注入到提示词里！
      let dynamicDifficulty = "medium";
      if (recentUsed) {
        dynamicDifficulty = `medium。⚠️【最高级别指令：强制排重】：你之前已出过答案为【${recentUsed}】的题，本次出题绝对、绝对不可再次重复考这些词汇对应的条文！请强制往知识库的后半部分寻找，从全新的冷门条文中抽取！(当前随机跳跃种子：${Math.floor(Math.random()*10000)})`;
      }

      console.log("准备发送的注入参数:", dynamicDifficulty);

      const res = await fetch(`/api/coze/quiz?t=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: 'no-store',
        body: JSON.stringify({
          action: "generate",
          chapter: chapterName,
          difficulty: dynamicDifficulty, // ⚡️ 带着警告发给后端！
          question_count: BATCH_SIZE,
          type: "fill",          
          question_type: "fill", 
          excludeIds: excludeIds,
        }),
      });
      
      let result = await res.json();
      
      if (typeof result === 'string') {
        const cleanedStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
        result = JSON.parse(cleanedStr);
      }
      
      const questionsData = result.questions || result.data || [];
      
      const processedQuestions = questionsData.map((q: any) => {
        let questionText = q.question || '';
        if (!questionText.includes('_')) {
          questionText = questionText + ' ______。';
        }
        
        let realAnswer = q.correct_answer || q.correctAnswer || q.answer || q.correct || q['正确答案'] || '';
        const explanationText = q.explanation || "解析待补充";
        
        // 提取正确答案
        const match = explanationText.match(/故正确答案为：\s*(.*?)[。！？\s]*$/);
        if (match && match[1]) {
          realAnswer = match[1].trim(); 
        }
        
        if (!realAnswer) {
          if (q.options && q.options.length > 0) {
             realAnswer = q.options[0]; 
          } else {
             realAnswer = "⚠️提取失败"; 
          }
        }
        
        return {
          id: q.id || Math.floor(Math.random() * 100000),
          question: questionText,
          options: q.options || [],
          correct_answer: realAnswer, 
          explanation: explanationText,
          source: q.source,
        };
      });

      if (processedQuestions.length > 0) {
        setAllQuestions(processedQuestions);
        setCurrentIndex(0);
        
        // 🚀 1. 保持原有的历史记录追踪（防重复出题的核心，千万不能丢！）
        setUsedQuestionIds(prev => [...prev, ...processedQuestions.map((q: any) => q.id)]);
        setUsedAnswersHistory(prev => [...prev, ...processedQuestions.map((q: any) => q.correct_answer)]);
        
        // 🧹 2. 新增：强制清空上一套题残留的答题状态（防张冠李戴的核心！）
        setSelectedAnswer(null);
        setAnswerState("unanswered");
        setIsSubmitted(false);
        setShowAnswer(false);
        
      } else {
        console.warn("API 成功返回，但没有题目数据");
      }
    } catch (error) {
      console.error("生成题目失败:", error);
    } finally {
      setLoading(false);
    }
  }, [chapterName]);

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);
    setShowAnswer(true);
    
    const currentQuestion = allQuestions[currentIndex];
    
    const normalizeString = (str: string) => {
      if (!str) return '';
      return str.replace(/[，,。、；；""''《》【】（）\s]/g, '').trim();
    };
    
    const userAnswer = normalizeString(selectedAnswer);
    const correctAnswer = normalizeString(currentQuestion?.correct_answer || '');
    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) {
      setAnswerState("correct");
      setScore(prev => prev + 1);
    } else {
      setAnswerState("wrong");
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerState("unanswered");
      setIsSubmitted(false);
      setShowAnswer(false);
    } else {
      // 🚀 把历史记录传给下一波请求
      fetchBatch(usedQuestionIds, usedAnswersHistory);
    }
  };

  const handleRetryCurrentSet = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerState("unanswered");
    setIsSubmitted(false);
    setShowAnswer(false);
    setScore(0);
  };

  const handleNextSet = () => {
    // 🚀 把历史记录传给下一波请求
    fetchBatch(usedQuestionIds, usedAnswersHistory);
  };

  // 初始化加载
  useEffect(() => {
    fetchBatch([], []);
  }, [fetchBatch]);

  // 洗牌选项
  useEffect(() => {
    if (allQuestions.length > 0 && currentIndex < allQuestions.length) {
      const currentQ = allQuestions[currentIndex];
      if (currentQ && currentQ.options && currentQ.options.length > 0) {
        setShuffledOptions([...currentQ.options].sort(() => Math.random() - 0.5));
      } else if (currentQ) {
         setShuffledOptions([currentQ.correct_answer, "干扰项A", "干扰项B", "干扰项C"]);
      }
    }
  }, [allQuestions, currentIndex]);

  const currentQuestion = allQuestions[currentIndex];
  const isLastInBatch = currentIndex === allQuestions.length - 1;

  const renderQuestionWithBlanks = (text: string, userAnswer: string | null, isCorrect: boolean, isSubmitted: boolean) => {
    if (!text) return null;
    const parts = text.split(/_{1,}/g); 
    return parts.map((part, idx) => {
      if (idx < parts.length - 1) {
        return (
          <span key={idx}>
            {part}
            <span
              className={cn(
                "mx-1 inline-block min-w-[80px] border-b-2 border-dashed px-2 py-0.5 text-center align-bottom transition-colors duration-300",
                !isSubmitted && userAnswer
                  ? "border-primary text-primary font-bold"
                  : isSubmitted && isCorrect
                    ? "border-jade text-jade font-bold"
                    : isSubmitted && !isCorrect
                      ? "border-vermillion text-vermillion font-bold line-through"
                      : "border-muted-foreground text-transparent"
              )}
            >
              {userAnswer || "填空"}
            </span>
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-4xl animate-spin">⏳</div>
          <p className="text-muted-foreground font-serif">仲景正在为你匹配经典条文...</p>
          <div className="mt-4 h-2 w-48 overflow-hidden rounded-full bg-muted mx-auto">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-jade" />
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="mb-2 font-serif text-lg font-medium">题目获取失败</h2>
          <p className="text-sm text-muted-foreground">可能后端未返回数据，请检查 Coze 接口配置</p>
          <button onClick={() => fetchBatch([], [])} className="mt-6 rounded-xl bg-primary px-6 py-2 text-white">重试</button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background ancient-texture">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href={`/quiz/${chapter}/choice`} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              第{currentIndex + 1}/{allQuestions.length}题
            </span>
          </div>
          <ScoreDisplay score={score} compact />
        </div>
      </header>

      <div className="h-1 bg-muted">
        <div
          className="h-full bg-jade transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / allQuestions.length) * 100}%` }}
        />
      </div>

      <main className="flex-1 px-4 pb-32 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-jade/10 px-3 py-1 text-xs font-medium text-jade">
            选词填空
          </span>
          <span className="text-xs text-muted-foreground">{chapterName}</span>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="font-serif text-lg leading-loose text-foreground">
            {renderQuestionWithBlanks(
              currentQuestion.question,
              selectedAnswer,
              answerState === "correct",
              isSubmitted
            )}
          </p>
        </div>

        <div className="mb-4">
          <p className="mb-3 text-sm text-muted-foreground">请选择恰当的词语填入空格：</p>
          <div className="flex flex-wrap gap-3">
            {shuffledOptions.map((option, optIdx) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correct_answer;

              let bubbleClass = "bg-card text-foreground border-border";
              if (isSubmitted) {
                if (isCorrect) {
                  bubbleClass = "bg-jade text-white border-jade";
                } else if (isSelected && !isCorrect) {
                  bubbleClass = "bg-vermillion text-white border-vermillion";
                } else {
                  bubbleClass = "bg-muted text-muted-foreground border-border opacity-50";
                }
              } else if (isSelected) {
                bubbleClass = "bg-primary/10 text-primary border-primary shadow-sm";
              }

              return (
                <button
                  key={`${currentQuestion.id}-${optIdx}-${option}`}
                  onClick={() => !isSubmitted && setSelectedAnswer(option)}
                  disabled={isSubmitted}
                  className={cn(
                    "rounded-xl border-2 px-5 py-3 text-base font-medium transition-all",
                    bubbleClass,
                    !isSubmitted && "hover:bg-accent active:scale-95"
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {showAnswer && (
          <div
            className={cn(
              "mt-6 rounded-xl border p-5 transition-all animate-in fade-in slide-in-from-bottom-4",
              answerState === "correct"
                ? "border-jade/30 bg-jade/5"
                : "border-vermillion/30 bg-vermillion/5"
            )}
          >
            <div className="mb-3 flex items-center gap-2">
              {answerState === "correct" ? (
                <CheckCircle className="h-5 w-5 text-jade" />
              ) : (
                <XCircle className="h-5 w-5 text-vermillion" />
              )}
              <span className={cn("font-semibold", answerState === "correct" ? "text-jade" : "text-vermillion")}>
                {answerState === "correct" ? "回答正确！" : "回答错误"}
              </span>
            </div>

            <p className="mb-2 text-sm text-muted-foreground">正确答案：</p>
            <p className="font-serif text-base leading-relaxed text-foreground">
              {currentQuestion.question.split(/_{1,}/).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="mx-1 font-bold text-jade underline decoration-jade/50 decoration-2 underline-offset-4">
                      {currentQuestion.correct_answer || "❓"}
                    </span>
                  )}
                </span>
              ))}
            </p>
            
            {currentQuestion.explanation && (
              <div className="mt-4 rounded-lg bg-background p-4 border border-border">
                <p className="mb-2 text-xs font-bold text-muted-foreground">仲景辨析</p>
                <p className="text-sm leading-relaxed text-foreground">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg gap-3">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={cn(
                "flex-1 rounded-xl py-3.5 font-bold transition-all",
                selectedAnswer ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" : "bg-muted text-muted-foreground"
              )}
            >
              确认答案
            </button>
          ) : isLastInBatch ? (
            <div className="flex w-full gap-3">
              <button onClick={handleRetryCurrentSet} className="flex-1 rounded-xl border border-border bg-card py-3.5 font-medium transition-all hover:bg-accent text-foreground">
                <RotateCcw className="mx-auto h-5 w-5" />
              </button>
              <button onClick={handleNextSet} className="flex-1 rounded-xl bg-primary py-3.5 font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-md">
                下一套 <ArrowRight className="ml-2 inline h-4 w-4" />
              </button>
            </div>
          ) : (
            <button onClick={handleNextQuestion} className="flex-1 rounded-xl bg-primary py-3.5 font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-md">
              下一题 <ArrowRight className="ml-2 inline h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}