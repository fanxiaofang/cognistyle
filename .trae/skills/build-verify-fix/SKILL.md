---
name: "build-verify-fix"
description: "执行构建检查、解析错误、尝试修复并重新验证的调试闭环。当用户遇到构建失败、TypeScript类型错误、JSX解析错误、模块找不到等编译/构建问题时调用。也适用于修改代码后需要验证是否引入新错误的场景。"
---

# Build-Verify-Fix 调试闭环

## 适用场景

- `npm run lint` 或 `npm run build` 报错
- TypeScript 类型不匹配、模块找不到
- JSX 标签闭合错误
- 修改代码后需要验证

## 项目构建命令

| 命令 | 用途 |
|------|------|
| `npm run lint` | TypeScript 类型检查 (`tsc --noEmit`) |
| `npm run build` | Vite 生产构建 (`vite build`) |

## 流程

### 1. 诊断

执行 `npm run lint`。如果通过则执行 `npm run build`。

### 2. 解析错误

对每个错误提取：
- **文件路径**：绝对路径
- **行号**：具体到行
- **错误类型**：类型不匹配 / JSX解析 / 模块导入 / 未使用变量
- **修复方向**：一行描述修复方式

### 3. 修复

按优先级修复：
1. JSX 结构错误（缺少闭合标签、多余的 `</div>`）→ SearchReplace
2. 类型不匹配 → 更新 interface 或添加类型断言
3. 模块 Import 路径错误 → 修正路径
4. 未使用变量 → 删除声明或添加 `_` 前缀

每次只修一种类型的错误，修完后立即重新诊断。

### 4. 验证

修复后必须重新运行 `npm run lint` 确认零错误。

## 本项目常见错误模式

| 错误特征 | 常见原因 | 修复方式 |
|---------|---------|---------|
| `The character "}" is not valid inside a JSX element` | JSX 中多余的 `}` | 检查该行上下 JSX 闭合标签 |
| `Unexpected end of file before a closing "div" tag` | `<div>` 未闭合 | 在 return 前补 `</div>` |
| `Type '...' is not assignable to type '...'` | 接口字段变更后未同步 | 更新类型定义 |
| `Cannot find module '...'` | import 路径错误 | 检查文件实际路径（使用 Glob） |
| `Property '...' does not exist on type '...'` | 从旧字段迁移到新字段 | 改为新字段名 |

## 执行约束

- **每次只修复一种错误类型**，不混合修复
- **修复后必须重新 lint**，不可假设通过
- **JSX 修复**前先用 Read 查看完整上下文（至少 10 行）
- **类型修复**前先用 Read 确认目标类型定义的完整结构
- 如果同一错误第二次修复后仍不通过，停下来分析根因而非继续尝试