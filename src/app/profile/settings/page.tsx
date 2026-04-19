"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import {
  ChevronLeft,
  User,
  Moon,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Info,
} from "lucide-react";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const settingsGroups = [
    {
      title: "账号",
      items: [
        { icon: User, label: "个人信息", value: "" },
      ],
    },
    {
      title: "偏好设置",
      items: [
        { icon: Moon, label: "深色模式", value: "", isToggle: true, state: isDarkMode, onChange: () => setIsDarkMode(!isDarkMode) },
        { icon: Bell, label: "消息通知", value: "", isToggle: true, state: notifications, onChange: () => setNotifications(!notifications) },
      ],
    },
    {
      title: "支持",
      items: [
        { icon: HelpCircle, label: "帮助中心", value: "" },
        { icon: Shield, label: "隐私政策", value: "" },
        { icon: Info, label: "关于我们", value: "v1.0.0" },
      ],
    },
  ];

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
            设置
          </h1>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto pb-24 pt-4">
        <div className="mx-auto max-w-lg px-4">
          {settingsGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              <p className="mb-2 px-2 text-xs text-muted-foreground">
                {group.title}
              </p>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && (
                        <span className="text-sm text-muted-foreground">
                          {item.value}
                        </span>
                      )}
                      {item.isToggle ? (
                        <button
                          onClick={item.onChange}
                          className={`relative h-6 w-11 rounded-full transition-colors ${
                            item.state ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                              item.state ? "left-[22px]" : "left-0.5"
                            }`}
                          />
                        </button>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 退出登录 */}
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-vermillion/30 py-3 text-vermillion transition-colors hover:bg-vermillion/5">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">退出登录</span>
          </button>

          {/* 版本信息 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              伤寒论研习平台 v1.0.0
            </p>
            <p className="text-xs text-muted-foreground">
              传承经典 · 守正创新
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
