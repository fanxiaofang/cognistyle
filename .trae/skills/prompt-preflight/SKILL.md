---
name: "prompt-preflight"
description: "在用户发送任务给 agent 之前，将非技术用户的口语化需求翻译为项目专属的技术词汇和精确 prompt，同时检查架构合规、代码风格、语意精确度。触发条件：用户说「帮我看下这个 prompt」「预检一下」「这个需求怎么描述更专业」「检查我的提问」，或用户即将发起涉及多文件/跨层修改的复杂任务前主动调用。"
---

# Prompt Preflight · 提示词预检与专业术语翻译

## 核心职责

1. **专业术语翻译** — 把非技术用户的口语化需求翻译成项目专属的技术词汇（这是 rules 文件不提供的能力）
2. **架构与风格预检** — 参照已加载的 `architecture.md` / `code-style.md` / `prompt-review.md` 检查用户 prompt 是否违反约束

---

## 术语翻译表（仅 agent 不知道的项目专属信息）

通用技术词汇（Motion、Tailwind、React 基础、TypeScript 基础）agent 已理解，**不需要翻译**。只翻译 agent 不可能知道的**本项目专属信息**。

### 设计系统

| 用户可能说 | 对应本项目 |
|-----------|-----------|
| "换颜色"/"主色调"/"强调色" | 青 `#00f0ff`（主色调）/ 品红 `#ff007f`（强调）/ 绿 `#39ff14`（成功）/ 黄 `#ffe600`（警示） |
| "背景色" | `bg-[#050814]` |
| "字体"/"字号" | `font-display`（VT323）/ `font-pixel`（Press Start 2P）/ `font-mono`（Share Tech Mono） |
| "赛博朋克效果"/"扫描线" | `grid-overlay` / `scanlines` / `crt-flicker`（index.css 预定义类） |

### 文件组织（代码该放哪）

| 用户可能说 | 对应本项目 |
|-----------|-----------|
| "调接口"/"存数据" | `src/services/`，组件不直接调 API |
| "新页面" | `src/pages/`，`App.tsx` 注册路由 |
| "新组件" | `src/components/`，命名导出 |
| "改类型" | `src/types.ts`（⚠️需 grep 引用 → 更新 consumer → `npm run lint`） |
| "API 类型" | `src/contracts/dualReport.ts` |
| "题库"/"题目" | `src/data/questions.ts` |
| "身份"/"档案" | `src/data/suggestions.ts` |

### 功能术语

| 用户可能说 | 对应本项目 |
|-----------|-----------|
| "双人报告"/"互补度" | `compatibility-report` 链路（API → service → DualReportPage） |
| "搭档类型"/"搭档标签" | `patternBadge`（镜像/拼图/齿轮/火花搭档），`PATTERN_BADGE_MAP` |
| "分享" | `share-report` / `PublicSharePage` / `shareCaption` |
| "历史记录" | `dualHistoryService`（localStorage）+ `DualHistoryPage` |
| "刷新后还在" | 答题进度用 `sessionStorage`，身份和历史用 `localStorage` |

---

## 比例响应规则

**原则：输出长度与 prompt 复杂度成正比。简单 prompt 不出全量。**

| 级别 | 触发条件 | 输出内容 |
|------|---------|---------|
| **L1** | 无模糊词、无跨层风险、无需术语翻译 | 仅: `✅ 无需优化，可直接执行` |
| **L2** | 1-2 个模糊词或范围缺失，无跨层风险 | 仅 【B】清单（3-5 行） |
| **L3** | 跨层风险 / types.ts / ≥3 文件 / 需要术语翻译 | 完整 【A】术语表 + 【B】清单 + 【C】优化版 prompt |

---

## 预检逻辑（参照 architecture.md / code-style.md / prompt-review.md）

以下仅列出本技能需要额外关注的检查点，不重复 rules 中已有的条目：

| 检查维度 | 核心问题 |
|---------|---------|
| **跨层引用** | 组件是否直接调了 API？页面是否被组件导入？data 是否有副作用？ |
| **types.ts 影响面** | 改了类型是否知道要 grep 引用 → 更新 consumer → 跑 lint？ |
| **量级模糊** | "弱化""太大""有点小" → 提示给具体数值 |
| **范围缺失** | "优化XX" → 提示列具体文件和区域 |
| **只有否定** | "不要这个" → 提示补充正向方向词 |
| **未声明影响面** | 多文件改动 → 提示声明预估范围 |

---

## 输出格式

**L1 输出**：`✅ 无需优化，可直接执行。`

**L2 输出**（仅清单，无术语翻译，无示例）：
```
⚠️ 范围缺失：请补充目标文件和区域
⚠️ 量级模糊：'弱化一点' → 建议补具体数值
✅ 架构无冲突
```

**L3 输出**（完整三区）：
```
【A】术语翻译: | 你的词 → 项目词 | ...
【B】预检清单: ⚠️ / ✅ 逐条
【C】优化版: 合并后可直接使用的 prompt
```

---

## 注意事项

- L1/L2 场景禁止输出术语表或示例，不浪费 token
- 架构与风格规则以已加载的 `architecture.md` / `code-style.md` 为准，本文件不重复抄录
- 只给建议，不改意图；只翻译，不篡改方向
