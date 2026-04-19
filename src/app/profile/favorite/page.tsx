"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, Heart, Trash2 } from "lucide-react";

const favorites = [
  {
    id: 1,
    title: "桂枝汤方义详解",
    chapter: "太阳病脉证并治",
    summary: "桂枝汤为群方之魁，调和营卫之总方。主治太阳中风证，解肌发表、调和营卫。",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "小柴胡汤组成",
    chapter: "少阳病脉证并治",
    summary: "小柴胡汤和解少阳，由柴胡、黄芩、人参、半夏、甘草、生姜、大枣组成。",
    date: "2024-01-14",
  },
  {
    id: 3,
    title: "麻黄汤与桂枝汤对比",
    chapter: "太阳病脉证并治",
    summary: "麻黄汤与桂枝汤均治太阳病，但麻黄汤主无汗表实，桂枝汤主有汗表虚。",
    date: "2024-01-13",
  },
];

export default function FavoritesPage() {
  const [items, setItems] = useState(favorites);

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
            我的收藏
          </h1>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto pb-24 pt-4">
        <div className="mx-auto max-w-lg px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="mb-2 text-lg font-medium">暂无收藏</p>
              <p className="text-sm text-muted-foreground">
                收藏感兴趣的条文和方剂
              </p>
              <Link
                href="/quiz"
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
              >
                去学习
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                共 {items.length} 条收藏
              </p>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all hover:bg-vermillion/10 hover:text-vermillion group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <span className="mb-2 inline-block rounded-full bg-jade/10 px-2 py-0.5 text-xs text-jade">
                    {item.chapter}
                  </span>

                  <h3 className="mb-2 pr-8 font-serif text-base font-medium">
                    {item.title}
                  </h3>

                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {item.date}
                    </span>
                    <Link
                      href="/recite"
                      className="text-xs text-primary hover:underline"
                    >
                      深入学习
                    </Link>
                  </div>
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
