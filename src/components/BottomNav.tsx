"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Users, Network, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/quiz", icon: BookOpen, label: "答题" },
  { href: "/recite", icon: Users, label: "原文解惑" },
  { href: "/knowledge", icon: Network, label: "知识图谱" },
  { href: "/profile", icon: User, label: "我的" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-transform duration-200",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-xs font-medium transition-all duration-200",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
