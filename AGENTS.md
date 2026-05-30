# CogniStyle · 认知风格测评系统

> 第七区认知适配协议 · React 19 + Vite 6 + TypeScript · 赛博朋克主题

## 技术栈

React 19 · TypeScript 5.8 · Vite 6 · Tailwind CSS v4 · Motion · Lucide · html2canvas

## 项目架构

```text
src/
├── components/   # UI 组件
│   ├── QuestionCard.tsx        # 测评问卷卡片（Likert 量表）
│   ├── ResultsDisplay.tsx      # 测评结果展示与分享
│   ├── RadarChart.tsx          # 认知维度雷达图
│   ├── CognitiveHandbook.tsx   # 认知风格全图鉴
│   ├── PixelAvatar.tsx         # 16 种 SVG 像素风头像
│   └── SingleReportActions.tsx # 单报告操作按钮
├── pages/
│   ├── DualReportPage.tsx      # 双人互补报告页
│   └── PublicSharePage.tsx     # 公开分享页
├── services/
│   ├── compatibilityService.ts   # 互补报告 API 调用
│   └── resultSnapshotService.ts  # 结果快照服务
├── contracts/
│   └── dualReport.ts           # API 请求/响应类型契约
├── data/
│   ├── questions.ts            # 测评题库与维度元数据
│   └── suggestions.ts          # 认知身份档案（16 种身份）
├── utils/
│   └── buildResultSnapshot.ts  # 结果快照构建工具
├── types.ts                    # 全局类型定义（3 层维度 + 16 格身份）
├── App.tsx                     # 路由、状态管理、测评主流程
├── index.css                   # Tailwind 主题 + 赛博朋克视觉特效
└── main.tsx                    # 应用入口

functions/api/                  # Cloudflare Workers API
├── compatibility-report.js     # 互补度评分计算
├── compatibility-report.config.js  # 评分参数配置
├── results.js                  # 结果 CRUD
├── results/delete.js           # 结果删除
├── share-report.js             # 分享报告生成
└── share/[token].js            # 公开分享读取

scripts/
└── compatibility-tuning.ts     # 互补度算法调参工具
```

## 核心架构规则

- **类型系统**：所有共享类型定义在 `src/types.ts`，按 CoreDimension（3维）→ CollaborationDimension（1维）→ RepresentationDimension（1维）三层组织
- **API 契约**：前后端通过 `src/contracts/dualReport.ts` 共享类型，API 路径常量集中管理
- **状态管理**：React useState + sessionStorage 持久化 + URL 参数分享，无外部状态库
- **路由**：自定义 `AppRoute` 判别联合类型，无 React Router，基于 `window.location.pathname` 派发
- **样式**：类名直接写在 JSX className 中（Tailwind），无独立 CSS 文件（除 index.css 主题定义）
- **构建**：`npm run lint`（tsc --noEmit）→ `npm run build`（vite build）

## AI 协作规则入口

- **架构约束**：`.trae/rules/architecture.md`
- **代码风格**：`.trae/rules/code-style.md`
- **可用技能**：`.trae/skills/`（build-verify-fix / ui-theme-adjust / algorithm-tune / vibecoding-retro）

## 关键约束（AI agent 必须遵守）

1. 所有组件使用函数式声明 + TypeScript 类型注解，禁止 class 组件
2. 修改 `types.ts` 前先评估对全项目的影响范围（参考 `.trae/rules/architecture.md` 检查清单）
3. 修改评分算法（compatibility-report.config.js / compatibilityService.ts）后必须运行 `npm run tune:compatibility` 验证分布
4. 每次代码修改后执行 `npm run lint` 确认零类型错误
5. 新增组件放 `src/components/`，页面级组件放 `src/pages/`
