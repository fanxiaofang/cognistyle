---
name: "algorithm-tune"
description: "运行互补度算法调参工具。当用户要求分析互补度分布、调整评分参数、验证固定样本得分时调用。基于 scripts/compatibility-tuning.ts。"
---

# 互补度算法调参

## 运行
`npm run tune:compatibility` 执行 `tsx scripts/compatibility-tuning.ts`

## 输出
### 固定样本（5组）
| 样本 | 验证目标 |
|------|---------|
| homogeneous-clone | 同质组合是否被压低 |
| balanced-complement | 中高差异是否进入50+ |
| high-complement-high-friction | 不错判为高分 |
| extreme-opposition | 稳定落入低分段 |
| workable-borderline | workable只保留边界组合 |

### 随机分布（50,000组）
基于25题Likert随机作答→归一化→双人报告，输出0-34/35-49/50-64/65-79/80+各区占比

## 参数位置
`functions/api/compatibility-report.config.js`

## 调参约束
- 一次只改一组参数
- floor每次调整不超过35
- dangerStart每次调0.05
- 权重和必须=1.0
- 改后立即 `npm run tune:compatibility` 对比

## 设计文档预期分布
- 0-34: 7-15%
- 35-49: 35-45%（主峰）
- 50-64: 30-35%
- 65-79: 5-10%
- 80+: 0.5-1.5%
"@ | Out-File -FilePath .trae/skills/algorithm-tune/SKILL.md -Encoding UTF8