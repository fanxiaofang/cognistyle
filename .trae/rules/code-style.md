# CogniStyle 代码风格规范

## TypeScript

- 所有函数参数和返回值必须显式标注类型
- 导出的函数必须声明返回类型
- `interface` 优于 `type`（对象结构场景）
- 字符串字面量联合用 `type`
- 禁止 `any`，未知类型用 `unknown`
- 数组用 `T[]` 而非 `Array<T>`

## React 组件

- 函数式组件，禁止 class 组件
- Props 内联类型标注或独立 interface
- 使用命名导出（`export function Foo()`）除非 App.tsx（根组件可用 default）
- Hooks 调用放在组件顶部，按 useState → useEffect → 自定义 Hook 顺序
- 事件处理函数命名：`handle` + 动作（`handleStartTest`, `handleSelectAnswer`, `handleReset`）

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `QuestionCard`, `ResultsDisplay` |
| 函数/变量 | camelCase | `buildResultSnapshot`, `currentQuestionIdx` |
| 类型/接口 | PascalCase | `DimensionScore`, `UserAnswers` |
| 常量 | UPPER_SNAKE_CASE | `ARCHETYPE_KEYS`, `RETRY_DELAYS_MS` |
| 文件名 | 组件 PascalCase.tsx，工具 camelCase.ts | `QuestionCard.tsx`, `compatibilityService.ts` |

## Tailwind CSS

- 样式全部写在 JSX `className` 属性中（不单独创建 .css 文件）
- 颜色使用设计系统 Token：
  - 青 `#00f0ff` — 主色调、信息、链接
  - 品红 `#ff007f` — 强调、主身份
  - 绿 `#39ff14` — 成功、维度高分
  - 黄 `#ffe600` — 警示、切换按钮
- 背景色：`bg-[#050814]`（主背景）
- 字体：`font-display`（VT323）/ `font-pixel`（Press Start 2P）/ `font-mono`（Share Tech Mono）
- 赛博朋克特效类：`grid-overlay` / `scanlines` / `crt-flicker`（定义在 index.css）

## 错误处理

- API 调用使用 try/catch，错误消息为中文
- 网络错误（TypeError）自动重试（最多 3 次，间隔 1s/2s/4s）
- 非网络错误直接抛出，不重试
