"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/BottomNav";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import Link from "next/link";

export default function HomePage() {
  const [showMain, setShowMain] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  // 中药元素数据在客户端挂载后生成
  const [herbs, setHerbs] = useState<Array<{
    id: number;
    left: number;
    delay: number;
    duration: number;
    size: number;
    rotate: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    // 生成中药元素数据
    setHerbs(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 15 + Math.random() * 10,
        size: 20 + Math.random() * 30,
        rotate: Math.random() * 360,
        opacity: 0.06 + Math.random() * 0.08,
      }))
    );
  }, []);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      setShowMain(true);
    }, 600);
  };

  // 如果显示主页面，渲染主界面
  if (showMain) {
    return <MainPage />;
  }

  // 清新淡雅的中医研习欢迎页
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* 中药装饰元素 - 漂浮的叶片 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {herbs.map((herb) => (
          <div
            key={herb.id}
            className="absolute animate-float"
            style={{
              left: `${herb.left}%`,
              top: '-60px',
              animationDelay: `${herb.delay}s`,
              animationDuration: `${herb.duration}s`,
              opacity: herb.opacity,
            }}
          >
            {/* 中药叶片图标 */}
            <svg
              width={herb.size}
              height={herb.size}
              viewBox="0 0 24 24"
              className="text-emerald-800"
              style={{ transform: `rotate(${herb.rotate}deg)` }}
            >
              <path
                fill="currentColor"
                d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* 淡淡的圆形装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-200/30 to-transparent" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-gradient-to-tl from-teal-200/30 to-transparent" />
        <div className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-gradient-to-r from-cyan-200/20 to-transparent" />
      </div>

      {/* 中央内容 */}
      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col items-center justify-center px-6 transition-all duration-700",
          isEntering ? "scale-105 opacity-0" : "scale-100 opacity-100"
        )}
      >
        {/* 顶部装饰 - 葫芦（象征悬壶济世） */}
        <div className="mb-8 animate-pulse">
          <svg className="h-16 w-16 text-emerald-600/80" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2C10.89,2 10,2.89 10,4C10,4.73 10.41,5.38 11,5.73V6H13V5.73C13.59,5.38 14,4.73 14,4C14,2.89 13.11,2 12,2M8.5,4C7.67,4 7,4.67 7,5.5C7,6.33 7.67,7 8.5,7C9.33,7 10,6.33 10,5.5C10,4.67 9.33,4 8.5,4M15.5,4C14.67,4 14,4.67 14,5.5C14,6.33 14.67,7 15.5,7C16.33,7 17,6.33 17,5.5C17,4.67 16.33,4 15.5,4M10,8C5.58,8 2,10.69 2,14C2,17.31 5.58,20 10,20C14.42,20 18,17.31 18,14C18,10.69 14.42,8 10,8M10,18C6.69,18 4,16.08 4,14C4,11.92 6.69,10 10,10C13.31,10 16,11.92 16,14C16,16.08 13.31,18 10,18Z" />
          </svg>
        </div>

        {/* 主标题区 */}
        <div className="mb-6 text-center">
          <h1 className="mb-3 font-serif text-4xl font-bold tracking-wide text-emerald-800 drop-shadow-sm">
            伤寒论研习
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-400" />
            <p className="text-sm font-medium text-emerald-600/80">
              张仲景 · 勤求古训
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-400" />
          </div>
        </div>

        {/* 古典名言卷轴 */}
        <div className="relative mx-4 max-w-md">
          <div className="rounded-2xl border border-emerald-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-sm">
            {/* 边框装饰 */}
            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-300/20" />
            
            <p className="mb-4 text-center font-serif text-lg leading-relaxed text-emerald-800">
              「观其脉证，知犯何逆，随证治之」
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600/70">
              <span>勤学古训</span>
              <span className="text-emerald-400">·</span>
              <span>深研医理</span>
              <span className="text-emerald-400">·</span>
              <span>方能临证自如</span>
            </div>
          </div>
          
          {/* 底部装饰 */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <svg className="h-4 w-4 text-emerald-500/60" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
            <span className="text-xs text-emerald-500/60">岐黄之术 · 薪火相传</span>
            <svg className="h-4 w-4 text-emerald-500/60" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
            </svg>
          </div>
        </div>

        {/* 进入按钮 */}
        <button
          onClick={handleEnter}
          className="group relative mt-10 cursor-pointer"
        >
          {/* 按钮光晕 */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-emerald-400/30 blur-lg transition-all duration-500 group-hover:from-emerald-400/50 group-hover:via-teal-400/50 group-hover:to-emerald-400/50" />
          
          {/* 按钮本体 */}
          <div className="relative flex items-center gap-3 rounded-full border-2 border-emerald-400/70 bg-white/90 px-10 py-4 shadow-lg transition-all duration-300 hover:border-emerald-500 hover:bg-white">
            <span className="font-medium tracking-wide text-emerald-700 transition-colors group-hover:text-emerald-800">
              进入学习
            </span>
            <svg
              className="h-5 w-5 text-emerald-600 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-emerald-300/50" />
          <div className="h-2 w-2 rounded-full bg-emerald-400/50" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-emerald-300/50" />
        </div>
      </div>

      {/* CSS 动画样式 */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(-60px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.1;
          }
          90% {
            opacity: 0.08;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}

// 主页面组件
function MainPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background ancient-texture">
      {/* 顶部区域 */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <h1 className="font-serif text-lg font-bold tracking-wide">
            伤寒论研习
          </h1>
          <ScoreDisplay score={256} compact />
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 px-4 pb-24 pt-6">
        {/* 欢迎语 */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-vermillion/10">
              <svg
                className="h-8 w-8 text-vermillion"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="mb-1 font-serif text-lg font-semibold">
                张仲景·伤寒论
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                「观其脉证，知犯何逆，随证治之」
                <br />
                勤学古训，深研医理，方能临证自如。
              </p>
            </div>
          </div>
        </div>

        {/* 快捷入口 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            研习之道
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* 1. 对话仲景 */}
            <QuickEntryCard
              href="/recite"
              icon={
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 18.25a8 8 0 008-8c0-1.657-2.686-3-6-3-2.213 0-4.063.815-5.453 2.15M12 18.25a8 8 0 01-8-8c0-1.657 2.686-3 6-3 2.213 0 4.063.815 5.453 2.15M12 18.25l1-4.5M12 18.25l-1-4.5M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75m6-3h.75m-.75 3h.75m-.75 3h.75" />
                </svg>
              }
              title="原文解惑"
              subtitle="对话仲景"
              color="jade"
            />
            {/* 2. 知识图谱 */}
            <QuickEntryCard
              href="/knowledge"
              icon={
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              }
              title="知识图谱"
              subtitle="理清脉络"
              color="gold"
            />
            {/* 3. 答题研习 */}
            <QuickEntryCard
              href="/quiz"
              icon={
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              }
              title="答题研习"
              subtitle="巩固所学"
              color="vermillion"
            />
            {/* 4. 我的研习 */}
            <QuickEntryCard
              href="/profile"
              icon={
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              }
              title="我的研习"
              subtitle="查看进度"
              color="ink"
            />
          </div>
        </div>

        {/* 学习统计 */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            本周研习
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <StatItem value="12" label="答题数" />
            <StatItem value="8" label="连续天数" />
            <StatItem value="96%" label="正确率" />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

interface QuickEntryCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: "vermillion" | "jade" | "gold" | "ink";
}

const colorMap = {
  vermillion: "bg-vermillion/10 text-vermillion",
  jade: "bg-jade/10 text-jade",
  gold: "bg-gold/10 text-gold",
  ink: "bg-ink/10 text-ink",
};

function QuickEntryCard({
  href,
  icon,
  title,
  subtitle,
  color,
}: QuickEntryCardProps) {
  return (
    <a
      href={href}
      className="group flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
    >
      <div
        className={cn(
          "mb-3 flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110",
          colorMap[color]
        )}
      >
        {icon}
      </div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </a>
  );
}

interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold text-vermillion">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
