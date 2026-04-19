"use client";

import { Trophy, Star, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  compact?: boolean;
}

export function ScoreDisplay({ score, compact = false }: ScoreDisplayProps) {
  if (compact) {
    return (
      <Link
        href="/profile"
        className="flex items-center gap-1.5 rounded-full bg-vermillion/10 px-2.5 py-1 text-xs font-medium text-vermillion transition-colors hover:bg-vermillion/20"
      >
        <Star className="h-3.5 w-3.5 fill-vermillion" />
        <span>{score}</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vermillion/10">
        <Trophy className="h-5 w-5 text-vermillion" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">我的积分</span>
        <span className="text-xl font-bold text-foreground">{score}</span>
      </div>
    </div>
  );
}

interface RankBadgeProps {
  rank: number;
}

const rankConfig = [
  { min: 0, max: 100, title: "初窥门径", color: "text-muted-foreground" },
  { min: 101, max: 500, title: "渐入佳境", color: "text-jade" },
  { min: 501, max: 1000, title: "登堂入室", color: "text-gold" },
  { min: 1001, max: 3000, title: "融会贯通", color: "text-vermillion" },
  { min: 3001, max: Infinity, title: "出神入化", color: "text-primary" },
];

export function getRankConfig(score: number) {
  return rankConfig.find((r) => score >= r.min && score <= r.max) || rankConfig[0];
}

export function RankBadge({ rank }: RankBadgeProps) {
  const getRankTitle = (rank: number) => {
    if (rank <= 10) return "名列前茅";
    if (rank <= 50) return "学有小成";
    if (rank <= 100) return "勤学不辍";
    return "初露锋芒";
  };

  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-vermillion bg-vermillion/10 text-sm font-bold text-vermillion">
        {rank}
      </span>
      <span className="text-sm font-medium text-muted-foreground">
        {getRankTitle(rank)}
      </span>
    </div>
  );
}

interface StreakDisplayProps {
  days: number;
}

export function StreakDisplay({ days }: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
      <Zap className="h-4 w-4 text-gold" />
      <span className="text-sm font-medium">{days}天连续</span>
    </div>
  );
}

interface RecentActivityProps {
  lastStudy: string;
}

export function RecentActivity({ lastStudy }: RecentActivityProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Clock className="h-3.5 w-3.5" />
      <span>上次学习：{lastStudy}</span>
    </div>
  );
}
