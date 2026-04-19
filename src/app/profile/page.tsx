"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Star,
  BookOpen,
  Heart,
  Sword,
  Settings,
  User,
  Crown,
  Medal,
  Award,
  LogOut,
  Moon,
  Bell,
  HelpCircle,
  Shield,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// 用户数据
const userData = {
  name: "岐黄学子",
  avatar: null,
  score: 256,
  rank: 42,
  totalUsers: 1280,
  streak: 8,
  lastStudy: "10分钟前",
};

// 排名配置
const rankConfig = [
  { min: 1, max: 10, title: "名列前茅", icon: Crown, color: "text-gold" },
  { min: 11, max: 50, title: "学有小成", icon: Medal, color: "text-jade" },
  { min: 51, max: 100, title: "勤学不辍", icon: Award, color: "text-vermillion" },
  { min: 101, max: Infinity, title: "初露锋芒", icon: Star, color: "text-muted-foreground" },
];

const getUserRankConfig = (rank: number) => {
  return rankConfig.find((r) => rank >= r.min && rank <= r.max) || rankConfig[rankConfig.length - 1];
};

// 错题示例
const wrongQuestions = [
  {
    id: 1,
    chapter: "太阳病脉证并治",
    question: "麻黄汤的组成药物不包括：",
    userAnswer: "葛根",
    correctAnswer: "白术",
    date: "2024-01-15",
  },
  {
    id: 2,
    chapter: "阳明病脉证并治",
    question: "白虎汤的主治证候是：",
    userAnswer: "阳明腑实证",
    correctAnswer: "阳明气分热证",
    date: "2024-01-14",
  },
];

// 收藏示例
const favorites = [
  {
    id: 1,
    title: "桂枝汤方义",
    chapter: "太阳病脉证并治",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "小柴胡汤组成",
    chapter: "少阳病脉证并治",
    date: "2024-01-14",
  },
];

// 已斩题目示例
const zhanedQuestions = [
  {
    id: 1,
    question: "太阳病提纲证：",
    answer: "太阳之为病，脉浮，头项强痛而恶寒。",
    date: "2024-01-15",
  },
  {
    id: 2,
    question: "阳明病提纲证：",
    answer: "阳明之为病，胃家实是也。",
    date: "2024-01-14",
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "wrong" | "favorite" | "zhaned" | "settings"
  >("wrong");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userData.name);
  const userRankConfig = getUserRankConfig(userData.rank);

  const menuItems = [
    { id: "wrong", icon: BookOpen, label: "我的错题", count: wrongQuestions.length },
    { id: "favorite", icon: Heart, label: "我的收藏", count: favorites.length },
    { id: "zhaned", icon: Sword, label: "已斩题目", count: zhanedQuestions.length },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background ancient-texture">
      {/* 顶部区域 */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <h1 className="font-serif text-lg font-bold tracking-wide">我的</h1>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto pb-24 pt-4">
        <div className="mx-auto max-w-lg px-4">
          {/* 用户信息卡片 */}
          <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              {/* 头像 */}
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vermillion/10 text-2xl font-serif text-vermillion">
                  {userData.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    "岐"
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <User className="h-3 w-3" />
                </button>
              </div>

              {/* 名称和称号 */}
              <div className="flex-1">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="text-xs text-primary"
                    >
                      保存
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-lg font-semibold">
                      {userData.name}
                    </h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      编辑
                    </button>
                  </div>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <userRankConfig.icon className={cn("h-4 w-4", userRankConfig.color)} />
                  <span className={cn("text-sm", userRankConfig.color)}>
                    {userRankConfig.title}
                  </span>
                </div>
              </div>
            </div>

            {/* 统计数据 */}
            <div className="mt-5 grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2">
                <Trophy className="mb-1 h-5 w-5 text-vermillion" />
                <span className="text-lg font-bold">{userData.score}</span>
                <span className="text-xs text-muted-foreground">积分</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2">
                <Medal className="mb-1 h-5 w-5 text-gold" />
                <span className="text-lg font-bold">{userData.rank}</span>
                <span className="text-xs text-muted-foreground">排名</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2">
                <Star className="mb-1 h-5 w-5 text-jade" />
                <span className="text-lg font-bold">{userData.streak}</span>
                <span className="text-xs text-muted-foreground">连续</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2">
                <BookOpen className="mb-1 h-5 w-5 text-primary" />
                <span className="text-lg font-bold">156</span>
                <span className="text-xs text-muted-foreground">答题</span>
              </div>
            </div>
          </div>

          {/* 排名进度 */}
          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                当前排名：第{userData.rank}名 / 共{userData.totalUsers}人
              </span>
              <span className="text-xs text-vermillion">
                距离下一称号还需 {100 - (userData.rank % 100)} 分
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-vermillion to-gold"
                style={{ width: `${(1 - userData.rank / userData.totalUsers) * 100}%` }}
              />
            </div>
          </div>

          {/* 功能菜单 */}
          <div className="mb-4 rounded-xl border border-border bg-card divide-y divide-border">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={`/profile/${item.id}`}
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count > 0 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {item.count}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>

          {/* 设置菜单 */}
          <div className="rounded-xl border border-border bg-card">
            <Link
              href="/profile/settings"
              className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">设置</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
