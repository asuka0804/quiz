"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, Sword, Trash2, CheckCircle } from "lucide-react";

const zhanedQuestions = [
  {
    id: 1,
    question: "太阳病提纲证",
    answer: "太阳之为病，脉浮，头项强痛而恶寒。",
    chapter: "太阳病脉证并治",
    date: "2024-01-15",
  },
  {
    id: 2,
    question: "阳明病提纲证",
    answer: "阳明之为病，胃家实是也。",
    chapter: "阳明病脉证并治",
    date: "2024-01-14",
  },
  {
    id: 3,
    question: "少阳病提纲证",
    answer: "少阳之为病，口苦、咽干、目眩也。",
    chapter: "少阳病脉证并治",
    date: "2024-01-13",
  },
  {
    id: 4,
    question: "太阴病提纲证",
    answer: "太阴之为病，腹满而吐，食不下，自利益甚，时腹自痛。",
    chapter: "太阴病脉证并治",
    date: "2024-01-12",
  },
  {
    id: 5,
    question: "少阴病提纲证",
    answer: "少阴之为病，脉微细，但欲寐也。",
    chapter: "少阴病脉证并治",
    date: "2024-01-11",
  },
];

export default function ZhanedQuestionsPage() {
  const [items, setItems] = useState(zhanedQuestions);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background ancient-texture">
      {/* 顶部区域 */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="ml-2 flex-1 font-serif text-base font-bold tracking-wide">
            已斩题目
          </h1>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto pb-24 pt-4">
        <div className="mx-auto max-w-lg px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Sword className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="mb-2 text-lg font-medium">暂无已斩题目</p>
              <p className="text-sm text-muted-foreground">
                答题时点击「斩题」标记已掌握的内容
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
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  共 {items.length} 道已斩题目
                </p>
                <div className="flex items-center gap-1 text-xs text-gold">
                  <Sword className="h-4 w-4" />
                  <span>已掌握</span>
                </div>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gold/30 bg-gold/5 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
                    }
                    className="w-full p-4 text-left transition-colors hover:bg-gold/10"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sword className="h-4 w-4 text-gold" />
                        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs text-gold">
                          {item.chapter}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.date}
                      </span>
                    </div>
                    <p className="font-serif text-sm font-medium">
                      {item.question}
                    </p>
                  </button>

                  {expandedId === item.id && (
                    <div className="border-t border-gold/30 p-4">
                      <div className="mb-4 rounded-lg border border-border bg-card p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-jade" />
                          <span className="text-xs font-medium text-jade">
                            正确答案
                          </span>
                        </div>
                        <p className="font-serif text-sm leading-relaxed">
                          {item.answer}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <Link
                          href="/recite"
                          className="text-xs text-primary hover:underline"
                        >
                          背诵练习
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-vermillion"
                        >
                          <Trash2 className="h-3 w-3" />
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
