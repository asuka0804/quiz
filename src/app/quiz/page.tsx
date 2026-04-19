"use client";

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const chapters = [
  {
    id: "taiyang",
    name: "辨太阳病脉证并治",
    description: "太阳病，脉浮，头项强痛而恶寒",
    count: 178,
    color: "vermillion",
  },
  {
    id: "yangming",
    name: "辨阳明病脉证并治",
    description: "阳明之为病，胃家实是也",
    count: 84,
    color: "gold",
  },
  {
    id: "shaoyang",
    name: "辨少阳病脉证并治",
    description: "少阳之为病，口苦、咽干、目眩也",
    count: 10,
    color: "jade",
  },
  {
    id: "taiyin",
    name: "辨太阴病脉证并治",
    description: "太阴之为病，腹满而吐，食不下",
    count: 8,
    color: "ink",
  },
  {
    id: "shaoyin",
    name: "辨少阴病脉证并治",
    description: "少阴之为病，脉微细，但欲寐也",
    count: 45,
    color: "vermillion",
  },
  {
    id: "jueyin",
    name: "辨厥阴病脉证并治",
    description: "厥阴之为病，消渴，气上撞心",
    count: 56,
    color: "gold",
  },
  {
    id: "huoluan",
    name: "辨霍乱病脉证并治",
    description: "问曰：病有霍乱者何？答曰：呕吐而利",
    count: 10,
    color: "jade",
  },
  {
    id: "yangyangyi",
    name: "辨阴阳易瘥后劳复病脉证并治",
    description: "大病瘥后，劳复者，枳实栀子汤主之",
    count: 7,
    color: "ink",
  },
];

const colorMap = {
  vermillion: {
    bg: "bg-vermillion/10",
    border: "border-vermillion/30",
    text: "text-vermillion",
    hover: "hover:bg-vermillion/15",
  },
  gold: {
    bg: "bg-gold/10",
    border: "border-gold/30",
    text: "text-gold",
    hover: "hover:bg-gold/15",
  },
  jade: {
    bg: "bg-jade/10",
    border: "border-jade/30",
    text: "text-jade",
    hover: "hover:bg-jade/15",
  },
  ink: {
    bg: "bg-ink/10",
    border: "border-ink/30",
    text: "text-ink",
    hover: "hover:bg-ink/15",
  },
};

export default function QuizPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background ancient-texture">
      {/* 顶部区域 */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-lg font-bold tracking-wide">
            答题研习
          </h1>
          <ScoreDisplay score={256} compact />
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 px-4 pb-24 pt-4">
        <p className="mb-4 text-sm text-muted-foreground">
          选择章节开始答题，每章包含选择题、填空题、病案分析三种题型。
        </p>

        {/* 章节网格 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          {chapters.map((chapter, index) => {
            const colors = colorMap[chapter.color as keyof typeof colorMap];
            return (
              <Link
                key={chapter.id}
                href={`/quiz/${chapter.id}`}
                className={cn(
                  "group relative flex flex-col rounded-xl border p-4 transition-all duration-200 hover:shadow-lg",
                  colors.bg,
                  colors.border,
                  colors.hover
                )}
              >
                {/* 序号印章 */}
                <span
                  className={cn(
                    "absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm",
                    colors.bg,
                    colors.text
                  )}
                >
                  {index + 1}
                </span>

                {/* 章节名称 */}
                <h3
                  className={cn(
                    "mb-2 pr-6 font-serif text-sm font-semibold leading-snug",
                    colors.text
                  )}
                >
                  {chapter.name}
                </h3>

                {/* 描述 */}
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                  {chapter.description}
                </p>

                {/* 题量 */}
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {chapter.count} 条条文
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100",
                      colors.text
                    )}
                  >
                    开始答题 →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
