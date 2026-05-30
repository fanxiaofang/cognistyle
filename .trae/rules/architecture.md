# CogniStyle 架构约束

## 文件组织

### 文件大小上限
- 组件文件（.tsx）：≤ 300 行
- 服务/工具文件（.ts）：≤ 200 行
- 类型定义文件：≤ 250 行
- 超过上限时必须拆分

### 目录职责
| 目录 | 允许内容 | 禁止内容 |
|------|---------|---------|
| `src/components/` | 可复用 UI 组件 | 页面级状态逻辑、路由、API 调用 |
| `src/pages/` | 页面组件、路由级状态 | 被其他组件直接导入（只能被 App.tsx 引用） |
| `src/services/` | API 调用、数据获取 | UI 代码、JSX |
| `src/data/` | 静态配置、题库、档案 | 运行时逻辑、API 调用 |
| `src/utils/` | 纯函数工具 | 副作用、API 调用、JSX |
| `src/contracts/` | API 请求/响应类型 | 实现代码 |
| `functions/api/` | Cloudflare Worker 处理函数 | 前端代码、JSX |

## 依赖方向（必须遵守）

```
pages → components ✅
pages → services ✅
components → utils ✅
components → services ❌  // 组件不能直接调 API
components → pages ❌     // 组件不能引用页面
data → services ❌        // 静态数据不能有副作用
```

## 类型系统

### 修改 types.ts 的检查清单
1. 搜索全项目引用（grep 被修改的类型名）
2. 更新所有 consumer 的类型签名
3. 更新 `src/data/questions.ts` 中的 dimensionMeta（如果改维度定义）
4. 更新 `src/data/suggestions.ts` 中的身份档案（如果改 ArchetypeKey 或 ProfileId）
5. 运行 `npm run lint` 确认零错误

### 类型定义规则
- 判别联合类型用 `type X = A | B | C`（如 AppRoute, AllDimensionId）
- 对象结构用 `interface`（如 Question, DimensionScore, CognitiveArchetype）
- 字符串字面量联合用 `type`（如 ArchetypeKey, DepartmentId）
