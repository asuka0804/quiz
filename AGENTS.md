# 伤寒论研习平台

## 项目概述

这是一个古香古色的《伤寒论》学习平台，帮助用户通过答题、背诵、知识图谱等方式学习中医经典。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI 集成**: coze-coding-dev-sdk (LLM 流式对话)

## 目录结构

```
├── public/                     # 静态资源
├── scripts/                   # 构建与启动脚本
├── src/
│   ├── app/                   # 页面路由
│   │   ├── page.tsx           # 首页
│   │   ├── quiz/              # 答题模块
│   │   │   ├── page.tsx       # 章节选择
│   │   │   └── [chapter]/     # 各章节答题
│   │   │       ├── page.tsx   # 题型选择
│   │   │       ├── choice/    # 选择题
│   │   │       ├── fill/      # 填空题
│   │   │       └── case/      # 病案分析
│   │   ├── recite/            # 条文背诵模块
│   │   ├── knowledge/         # 知识图谱
│   │   ├── profile/           # 个人中心
│   │   │   ├── wrong/        # 错题本
│   │   │   ├── favorite/      # 收藏
│   │   │   ├── zhaned/       # 已斩题目
│   │   │   └── settings/     # 设置
│   │   └── api/
│   │       └── recite/        # LLM API 路由
│   ├── components/            # 组件
│   │   ├── BottomNav.tsx      # 底部导航
│   │   └── ScoreDisplay.tsx   # 积分显示
│   └── lib/
│       └── utils.ts           # 工具函数
└── package.json
```

## 设计风格

### 古香古色主题

- **背景**: 宣纸质感 (#FAF5EF)
- **主色**: 墨色 (#4A4A4A)
- **强调色**: 朱砂红 (#C75555)
- **辅助色**: 古铜色 (#B8860B)、青色 (#5F7A61)
- **字体**: Noto Serif SC (衬线体用于标题)

### 自定义 CSS 变量

```css
--vermillion: #C75555  /* 朱砂红 */
--gold: #B8860B        /* 古铜金 */
--jade: #5F7A61       /* 玉石绿 */
--ink: #3D3D3D         /* 墨色 */
```

## 主要功能

### 1. 答题模块 (`/quiz`)

- **章节选择**: 8 个六经辨证章节
  - 辨太阳病脉证并治
  - 辨阳明病脉证并治
  - 辨少阳病脉证并治
  - 辨太阴病脉证并治
  - 辨少阴病脉证并治
  - 辨厥阴病脉证并治
  - 辨霍乱病脉证并治
  - 辨阴阳易瘥后劳复病脉证并治

- **题型**:
  - **选择题**: 10 题/组，提交后显示解析，积分累计
  - **填空题**: 条文挖空，8 个气泡选项，实时反馈
  - **病案分析**: 模拟四诊合参，聊天框交互分析

### 2. 条文背诵 (`/recite`)

- 与张仲景数字人对话
- 支持条文检索、方剂组成、病机分析
- 流式输出，古典文言风格回复

### 3. 知识图谱 (`/knowledge`)

- SVG 可视化知识图谱
- 支持缩放、节点点击查看详情
- 六大经脉及其方剂的关联展示

### 4. 个人中心 (`/profile`)

- 用户信息与积分排名
- 称号系统: 名列前茅、学有小成、勤学不辍、初露锋芒
- 错题本、收藏、已斩题目
- 设置页面

## API 接口

### `/api/recite` (POST)

张仲景数字人对话接口，使用流式响应。

```typescript
// 请求
{
  "messages": [
    { "role": "user", "content": "背诵第一条" }
  ]
}

// 响应: text/event-stream (SSE)
```

## 开发规范

### Hydration 问题防范

1. 所有页面组件使用 `'use client'` 指令
2. 动态数据使用 `useState` + `useEffect`
3. 避免在 JSX 中直接使用 `Math.random()`

### LLM 集成 (必须后端)

- **仅在服务端**: 使用 coze-coding-dev-sdk
- **禁止前端调用**: 不能在 client 组件中直接调用 LLM
- **流式输出**: 使用 SSE 协议，`ReadableStream`

## 环境变量

| 变量名 | 说明 |
|--------|------|
| `COZE_WORKSPACE_PATH` | 项目根目录 |
| `DEPLOY_RUN_PORT` | 服务端口 (5000) |
| `COZE_PROJECT_DOMAIN_DEFAULT` | 访问域名 |

## 运行命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 生产
pnpm start
```
