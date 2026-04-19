"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, CheckCircle, Circle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const chapterInfo: Record<string, { name: string; description: string }> = {
  taiyang: {
    name: "辨太阳病脉证并治",
    description: "太阳病，脉浮，头项强痛而恶寒",
  },
  yangming: {
    name: "辨阳明病脉证并治",
    description: "阳明之为病，胃家实是也",
  },
  shaoyang: {
    name: "辨少阳病脉证并治",
    description: "少阳之为病，口苦、咽干、目眩也",
  },
  taiyin: {
    name: "辨太阴病脉证并治",
    description: "太阴之为病，腹满而吐，食不下",
  },
  shaoyin: {
    name: "辨少阴病脉证并治",
    description: "少阴之为病，脉微细，但欲寐也",
  },
  jueyin: {
    name: "辨厥阴病脉证并治",
    description: "厥阴之为病，消渴，气上撞心",
  },
  huoluan: {
    name: "辨霍乱病脉证并治",
    description: "问曰：病有霍乱者何？答曰：呕吐而利",
  },
  yangyangyi: {
    name: "辨阴阳易瘥后劳复病脉证并治",
    description: "大病瘥后，劳复者，枳实栀子汤主之",
  },
};

const questionTypes = [
  {
    id: "choice",
    name: "选择题",
    description: "每套10题，ABCD四选一",
    icon: CheckCircle,
    href: "choice",
    color: "vermillion",
    progress: { total: 50, completed: 23 },
  },
  {
    id: "fill",
    name: "填空题",
    description: "条文挖空，选择正确答案",
    icon: Circle,
    href: "fill",
    color: "jade",
    progress: { total: 30, completed: 12 },
  },
  {
    id: "case",
    name: "病案分析",
    description: "四诊合参，辨证论治",
    icon: FileText,
    href: "case",
    color: "gold",
    progress: { total: 20, completed: 8 },
  },
];

const colorMap = {
  vermillion: {
    bg: "bg-vermillion/10",
    border: "border-vermillion/30",
    text: "text-vermillion",
    hover: "hover:bg-vermillion/15",
    iconBg: "bg-vermillion/15",
  },
  gold: {
    bg: "bg-gold/10",
    border: "border-gold/30",
    text: "text-gold",
    hover: "hover:bg-gold/15",
    iconBg: "bg-gold/15",
  },
  jade: {
    bg: "bg-jade/10",
    border: "border-jade/30",
    text: "text-jade",
    hover: "hover:bg-jade/15",
    iconBg: "bg-jade/15",
  },
};

export default function ChapterQuizPage() {
  const params = useParams();
  const chapter = params.chapter as string;
  const info = chapterInfo[chapter] || { name: chapter, description: "" };

  return (
    <div className="flex min-h-screen flex-col bg-background ancient-texture">
      {/* 顶部区域 */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <Link
            href="/quiz"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="ml-2 flex-1 truncate font-serif text-base font-bold tracking-wide">
            答题研习
          </h1>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 px-4 pb-24 pt-4">
        {/* 章节信息 */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-2 font-serif text-lg font-semibold">
            {info.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {info.description}
          </p>
        </div>

        {/* 题型选择 */}
        <div className="space-y-4">
          {questionTypes.map((type) => {
            const colors = colorMap[type.color as keyof typeof colorMap];
            const progressPercent = Math.round(
              (type.progress.completed / type.progress.total) * 100
            );

            return (
              <Link
                key={type.id}
                href={`/quiz/${chapter}/${type.href}`}
                className={cn(
                  "group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200",
                  colors.bg,
                  colors.border,
                  colors.hover
                )}
              >
                {/* 图标 */}
                <div
                  className={cn(
                    "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl",
                    colors.iconBg
                  )}
                >
                  <type.icon className={cn("h-7 w-7", colors.text)} />
                </div>

                {/* 内容 */}
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className={cn("font-semibold", colors.text)}>
                      {type.name}
                    </h3>
                    <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                      {type.progress.completed}/{type.progress.total}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {type.description}
                  </p>
                  {/* 进度条 */}
                  <div className="h-1.5 overflow-hidden rounded-full bg-background">
                    <div
                      className={cn("h-full rounded-full transition-all", colors.text)}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* 箭头 */}
                <ChevronLeft
                  className={cn(
                    "h-5 w-5 rotate-180 text-muted-foreground transition-transform group-hover:translate-x-1",
                    colors.text
                  )}
                />
              </Link>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
