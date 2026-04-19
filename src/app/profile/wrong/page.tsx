"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, BookOpen, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const wrongQuestions = [
  {
    id: 1,
    chapter: "太阳病脉证并治",
    question: "麻黄汤的组成药物不包括：",
    options: ["麻黄", "桂枝", "白术", "杏仁"],
    userAnswer: "C",
    correctAnswer: "C",
    analysis: "麻黄汤由麻黄、桂枝、杏仁、甘草组成，不包括白术。白术是理中汤、四君子汤等方的组成药物。",
    date: "2024-01-15",
  },
  {
    id: 2,
    chapter: "阳明病脉证并治",
    question: "白虎汤的主治证候是：",
    options: ["阳明腑实证", "阳明气分热证", "阳明经证", "阳明湿热证"],
    userAnswer: "A",
    correctAnswer: "B",
    analysis: "白虎汤主治阳明气分热盛证，以大热、大汗、大渴、脉洪大四大症为主。阳明腑实证应用承气汤类治疗。",
    date: "2024-01-14",
  },
  {
    id: 3,
    chapter: "少阳病脉证并治",
    question: "小柴胡汤的组成中不包括：",
    options: ["柴胡", "黄芩", "白术", "人参"],
    userAnswer: "B",
    correctAnswer: "C",
    analysis: "小柴胡汤由柴胡、黄芩、人参、半夏、甘草、生姜、大枣组成，不包括白术。",
    date: "2024-01-13",
  },
];

export default function WrongQuestionsPage() {
  const [questions, setQuestions] = useState(wrongQuestions);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleClearAll = () => {
    setQuestions([]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background ancient-texture">
      {/* 顶部区域 */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-base font-bold tracking-wide">
            我的错题
          </h1>
          {questions.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex h-9 w-9 items-center justify-center rounded-full text-vermillion hover:bg-vermillion/10"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto pb-24 pt-4">
        <div className="mx-auto max-w-lg px-4">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="mb-2 text-lg font-medium">暂无错题</p>
              <p className="text-sm text-muted-foreground">
                再接再厉，继续保持！
              </p>
              <Link
                href="/quiz"
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
              >
                去答题
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                共 {questions.length} 道错题，记录学习中的薄弱环节
              </p>

              {questions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* 题目头部 */}
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === q.id ? null : q.id)
                    }
                    className="w-full p-4 text-left transition-colors hover:bg-muted/30"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full bg-vermillion/10 px-2 py-0.5 text-xs text-vermillion">
                        {q.chapter}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {q.date}
                      </span>
                    </div>
                    <p className="font-serif text-sm">{q.question}</p>
                  </button>

                  {/* 展开内容 */}
                  {expandedId === q.id && (
                    <div className="border-t border-border p-4">
                      {/* 选项 */}
                      <div className="mb-4 space-y-2">
                        {q.options.map((opt, i) => {
                          const key = String.fromCharCode(65 + i);
                          const isCorrect = key === q.correctAnswer;
                          const isWrong = key === q.userAnswer && key !== q.correctAnswer;

                          return (
                            <div
                              key={i}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border p-3",
                                isCorrect && "border-jade bg-jade/5",
                                isWrong && "border-vermillion bg-vermillion/5"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded text-xs font-bold",
                                  isCorrect && "bg-jade text-white",
                                  isWrong && "bg-vermillion text-white",
                                  !isCorrect && !isWrong && "bg-muted"
                                )}
                              >
                                {key}
                              </span>
                              <span className="flex-1 text-sm">{opt}</span>
                              {isCorrect && (
                                <span className="text-xs text-jade">正确答案</span>
                              )}
                              {isWrong && (
                                <span className="text-xs text-vermillion">你的答案</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* 解析 */}
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          解析：
                        </p>
                        <p className="text-sm">{q.analysis}</p>
                      </div>

                      {/* 操作按钮 */}
                      <div className="mt-4 flex gap-3">
                        <Link
                          href="/quiz/taiyang/choice"
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm hover:bg-muted"
                        >
                          <RotateCcw className="h-4 w-4" />
                          重新练习
                        </Link>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-vermillion hover:bg-vermillion/5"
                        >
                          <Trash2 className="h-4 w-4" />
                          移除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
