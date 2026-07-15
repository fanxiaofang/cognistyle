/**
 * 题目与评分机制分析脚本
 *
 * 输入：export-analytics.ts 导出的 NDJSON 文件
 * 输出：HTML 报告（含题目层 + 评分层分析）
 *
 * 用法：
 *   npm run analyze:questions -- --in=analytics-export-20260715.ndjson
 *   npm run analyze:questions -- --in=xxx.ndjson --out=report.html
 *
 * 分析维度：
 *   题目层：选项频次/熵/方差/难度/区分度
 *   评分层：身份分布/身份熵/维度得分直方图/维度间相关/匹配度分布
 *
 * 题目说明：
 *   - questionsGeneral 共 16 题，4 维度 × 4 题
 *   - 双极量表，value 1-4（无中立选项）
 *   - value 1/2 偏 leftPolarity，3/4 偏 rightPolarity
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { questionsGeneral, dimensionMeta } from '../src/data/questions';

// ============== 类型定义 ==============

interface AnalyticsRecord {
  friendId: string;
  createdAt: number;
  profileId: string;
  scores: {
    fieldIndependFieldDepend: number;
    wholisticAnalytic: number;
    exploratoryDirected: number;
    impulsiveReflective: number;
  };
  reportVersion: string;
  rawAnswers?: Record<number, number>;
  analyticsConsent?: boolean;
}

type AnswerMap = Record<number, number>;

interface QuestionStats {
  id: number;
  dimension: string;
  prompt: string;
  leftText: string;
  rightText: string;
  count: number;
  freqByValue: Record<number, number>;
  mean: number;
  variance: number;
  std: number;
  difficulty: number;
  entropy: number;
  discrimination: number;
  health: 'green' | 'yellow' | 'red';
  flags: string[];
}

// ============== 统计工具 ==============

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function variance(arr: number[]): number {
  if (arr.length === 0) return 0;
  const m = mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
}

function std(arr: number[]): number {
  return Math.sqrt(variance(arr));
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * p)));
  return sorted[idx];
}

function entropyBase(probs: number[], base: number): number {
  const validProbs = probs.filter((p) => p > 0);
  return -validProbs.reduce((s, p) => s + p * Math.log(p) / Math.log(base), 0);
}

function pearsonCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i += 1) {
    const xa = a[i] - ma;
    const xb = b[i] - mb;
    num += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }
  const denom = Math.sqrt(da) * Math.sqrt(db);
  return denom === 0 ? 0 : num / denom;
}

// ============== 数据加载 ==============

function loadNdjson(path: string): AnalyticsRecord[] {
  const raw = readFileSync(resolve(process.cwd(), path), 'utf8');
  const lines = raw.split('\n').filter((line) => line.trim().length > 0);
  const records: AnalyticsRecord[] = [];
  for (const line of lines) {
    try {
      records.push(JSON.parse(line) as AnalyticsRecord);
    } catch {
      // 跳过损坏行
    }
  }
  return records;
}

// ============== 题目层分析 ==============

function analyzeQuestions(records: AnalyticsRecord[]): QuestionStats[] {
  // 计算每题的统计
  const stats: QuestionStats[] = [];
  const n = records.length;

  // 为区分度计算，先对每个用户计算总分（所有 16 题答案的均值）
  // 然后取前 27% / 后 27% 作为高低分组
  const userAvgScores = records.map((r) => {
    const answers = r.rawAnswers ?? {};
    const vals = Object.values(answers);
    return vals.length > 0 ? mean(vals) : 0;
  });
  const p27 = percentile(userAvgScores, 0.27);
  const p73 = percentile(userAvgScores, 0.73);

  const highGroupIdx = new Set<number>();
  const lowGroupIdx = new Set<number>();
  userAvgScores.forEach((s, i) => {
    if (s >= p73) highGroupIdx.add(i);
    if (s <= p27) lowGroupIdx.add(i);
  });

  for (const q of questionsGeneral) {
    const allValues: number[] = [];
    const highValues: number[] = [];
    const lowValues: number[] = [];

    records.forEach((r, idx) => {
      const v = r.rawAnswers?.[q.id];
      if (typeof v === 'number' && v >= 1 && v <= 4) {
        allValues.push(v);
        if (highGroupIdx.has(idx)) highValues.push(v);
        if (lowGroupIdx.has(idx)) lowValues.push(v);
      }
    });

    const count = allValues.length;
    const freqByValue: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const v of allValues) freqByValue[v] = (freqByValue[v] || 0) + 1;

    const m = mean(allValues);
    const v = variance(allValues);
    const s = std(allValues);
    const difficulty = m / 4; // 0-1
    const probs = [1, 2, 3, 4].map((val) => freqByValue[val] / Math.max(1, count));
    const entropy = entropyBase(probs, 4);
    const discrimination = highValues.length > 0 && lowValues.length > 0
      ? mean(highValues) - mean(lowValues)
      : 0;

    const flags: string[] = [];
    let health: 'green' | 'yellow' | 'red' = 'green';

    // 红旗判定
    for (const val of [1, 2, 3, 4]) {
      const pct = freqByValue[val] / Math.max(1, count);
      if (pct < 0.05) flags.push(`选项${val}占比 ${(pct * 100).toFixed(1)}% (<5%)`);
    }
    if (entropy < 1.0) {
      flags.push(`熵 ${entropy.toFixed(2)} 偏低 (<1.0)`);
      health = 'yellow';
    }
    if (v < 0.3) {
      flags.push(`方差 ${v.toFixed(2)} 过低 (<0.3)`);
      health = health === 'green' ? 'yellow' : health;
    }
    if (difficulty < 0.2 || difficulty > 0.8) {
      flags.push(`难度 ${difficulty.toFixed(2)} 超出 [0.2, 0.8]`);
      health = health === 'green' ? 'yellow' : health;
    }
    if (discrimination < 0.2) {
      flags.push(`区分度 ${discrimination.toFixed(2)} 偏低 (<0.2)`);
      if (discrimination < 0.1) health = 'red';
      else if (health === 'green') health = 'yellow';
    }

    if (flags.length === 0) flags.push('正常');

    stats.push({
      id: q.id,
      dimension: q.dimension,
      prompt: q.prompt || '',
      leftText: q.leftText || '',
      rightText: q.rightText || '',
      count,
      freqByValue,
      mean: m,
      variance: v,
      std: s,
      difficulty,
      entropy,
      discrimination,
      health,
      flags,
    });
  }

  return stats;
}

// ============== 评分层分析 ==============

interface ScoringStats {
  totalRecords: number;
  profileDistribution: Array<{ profileId: string; count: number; pct: number }>;
  profileEntropy: number;
  profileEntropyMax: number;
  dimensionHistograms: Record<string, { bins: Array<{ range: string; count: number; pct: number }>; mean: number; std: number }>;
  dimensionCorrelation: Array<{ a: string; b: string; r: number }>;
  matchScoreStats: { mean: number; std: number; p10: number; p50: number; p90: number; min: number; max: number };
}

const SCORE_KEYS = [
  'fieldIndependFieldDepend',
  'wholisticAnalytic',
  'exploratoryDirected',
  'impulsiveReflective',
] as const;

const SCORE_LABELS: Record<string, string> = {
  fieldIndependFieldDepend: '场独立↔场依赖',
  wholisticAnalytic: '整体↔分析',
  exploratoryDirected: '探索↔定向',
  impulsiveReflective: '冲动↔反思',
};

function analyzeScoring(records: AnalyticsRecord[]): ScoringStats {
  const totalRecords = records.length;

  // 身份分布
  const profileCount = new Map<string, number>();
  for (const r of records) {
    profileCount.set(r.profileId, (profileCount.get(r.profileId) || 0) + 1);
  }
  const profileDistribution = [...profileCount.entries()]
    .map(([profileId, count]) => ({ profileId, count, pct: count / Math.max(1, totalRecords) }))
    .sort((a, b) => b.count - a.count);

  const profileProbs = profileDistribution.map((p) => p.pct);
  const profileEntropy = entropyBase(profileProbs, 16);
  const profileEntropyMax = Math.log2(16);

  // 维度得分直方图（0-1 归一化，分 10 桶）
  const dimensionHistograms: ScoringStats['dimensionHistograms'] = {};
  for (const key of SCORE_KEYS) {
    const values = records.map((r) => r.scores[key]).filter((v) => typeof v === 'number');
    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${(i * 0.1).toFixed(1)}-${((i + 1) * 0.1).toFixed(1)}`,
      count: 0,
      pct: 0,
    }));
    for (const v of values) {
      const idx = Math.min(9, Math.max(0, Math.floor(v * 10)));
      bins[idx].count += 1;
    }
    for (const bin of bins) bin.pct = bin.count / Math.max(1, values.length);
    dimensionHistograms[key] = {
      bins,
      mean: mean(values),
      std: std(values),
    };
  }

  // 维度间相关
  const dimensionCorrelation: Array<{ a: string; b: string; r: number }> = [];
  for (let i = 0; i < SCORE_KEYS.length; i += 1) {
    for (let j = i + 1; j < SCORE_KEYS.length; j += 1) {
      const a = records.map((r) => r.scores[SCORE_KEYS[i]]);
      const b = records.map((r) => r.scores[SCORE_KEYS[j]]);
      dimensionCorrelation.push({
        a: SCORE_KEYS[i],
        b: SCORE_KEYS[j],
        r: pearsonCorrelation(a, b),
      });
    }
  }

  // 注意：analytics 记录中没有 archetype.matchScore，这里用维度方差替代
  // 真实 matchScore 需要从 result:<friendId> KV 中读取，本脚本暂不深入
  const allScores = records.flatMap((r) => Object.values(r.scores));
  const matchScoreStats = {
    mean: mean(allScores),
    std: std(allScores),
    p10: percentile(allScores, 0.1),
    p50: percentile(allScores, 0.5),
    p90: percentile(allScores, 0.9),
    min: Math.min(...allScores),
    max: Math.max(...allScores),
  };

  return {
    totalRecords,
    profileDistribution,
    profileEntropy,
    profileEntropyMax,
    dimensionHistograms,
    dimensionCorrelation,
    matchScoreStats,
  };
}

// ============== HTML 报告生成 ==============

function healthColor(h: 'green' | 'yellow' | 'red'): string {
  return h === 'green' ? '#39ff14' : h === 'yellow' ? '#ffe600' : '#ff007f';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderQuestionTable(stats: QuestionStats[]): string {
  const rows = stats.map((q) => {
    const dimLabel = dimensionMeta[q.dimension]?.label || q.dimension;
    const freqPct = (val: number) => ((q.freqByValue[val] || 0) / Math.max(1, q.count) * 100).toFixed(1);
    const barWidth = (val: number) => (q.freqByValue[val] || 0) / Math.max(1, q.count) * 100;
    const color = healthColor(q.health);
    return `
      <tr style="border-bottom: 1px solid #1a2540;">
        <td style="padding: 8px; font-weight: bold; color: ${color};">${q.id}</td>
        <td style="padding: 8px; color: #94a3b8; font-size: 11px;">${escapeHtml(dimLabel)}</td>
        <td style="padding: 8px; max-width: 280px; font-size: 12px;">${escapeHtml(q.prompt)}</td>
        <td style="padding: 8px; text-align: center;">${q.count}</td>
        <td style="padding: 8px; text-align: center;">
          <div style="display: flex; gap: 4px; align-items: center; min-width: 120px;">
            ${[1, 2, 3, 4].map((val) => `
              <div style="flex: 1; text-align: center;">
                <div style="height: 28px; background: #0a1020; border: 1px solid #1a2540; position: relative;">
                  <div style="height: 100%; background: ${val <= 2 ? '#0066ff' : '#00f0ff'}; width: ${barWidth(val)}%; opacity: 0.7;"></div>
                </div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${freqPct(val)}%</div>
              </div>
            `).join('')}
          </div>
        </td>
        <td style="padding: 8px; text-align: center; font-family: monospace;">${q.mean.toFixed(2)}</td>
        <td style="padding: 8px; text-align: center; font-family: monospace;">${q.variance.toFixed(2)}</td>
        <td style="padding: 8px; text-align: center; font-family: monospace;">${q.difficulty.toFixed(2)}</td>
        <td style="padding: 8px; text-align: center; font-family: monospace;">${q.entropy.toFixed(2)} / 2</td>
        <td style="padding: 8px; text-align: center; font-family: monospace; color: ${q.discrimination < 0.2 ? '#ff007f' : q.discrimination < 0.3 ? '#ffe600' : '#39ff14'};">${q.discrimination.toFixed(2)}</td>
        <td style="padding: 8px; font-size: 11px; color: ${color};">${q.flags.map(escapeHtml).join('<br>')}</td>
      </tr>
    `;
  }).join('');

  return `
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr style="background: #0a1020; color: #00f0ff; font-family: monospace; font-size: 11px; text-transform: uppercase;">
          <th style="padding: 8px; text-align: left;">ID</th>
          <th style="padding: 8px; text-align: left;">维度</th>
          <th style="padding: 8px; text-align: left;">题目</th>
          <th style="padding: 8px;">样本</th>
          <th style="padding: 8px;">选项分布 (1=强左 · 2=偏左 · 3=偏右 · 4=强右)</th>
          <th style="padding: 8px;">均值</th>
          <th style="padding: 8px;">方差</th>
          <th style="padding: 8px;">难度P</th>
          <th style="padding: 8px;">熵</th>
          <th style="padding: 8px;">区分度D</th>
          <th style="padding: 8px; text-align: left;">诊断</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderScoringSection(s: ScoringStats): string {
  // 身份分布
  const profileRows = s.profileDistribution.map((p) => {
    const isOver = p.pct > 0.15;
    return `
      <tr style="border-bottom: 1px solid #1a2540;">
        <td style="padding: 6px 8px; font-family: monospace; color: ${isOver ? '#ff007f' : '#00f0ff'};">${escapeHtml(p.profileId)}</td>
        <td style="padding: 6px 8px; text-align: center;">${p.count}</td>
        <td style="padding: 6px 8px; text-align: center;">${(p.pct * 100).toFixed(1)}%</td>
        <td style="padding: 6px 8px; width: 200px;">
          <div style="background: #0a1020; border: 1px solid #1a2540; height: 16px;">
            <div style="height: 100%; background: ${isOver ? '#ff007f' : '#00f0ff'}; width: ${Math.min(100, p.pct * 200)}%; opacity: 0.7;"></div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // 维度直方图
  const histBlocks = SCORE_KEYS.map((key) => {
    const hist = s.dimensionHistograms[key];
    const label = SCORE_LABELS[key];
    const maxCount = Math.max(...hist.bins.map((b) => b.count), 1);
    const bars = hist.bins.map((b) => `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
        <div style="height: 60px; width: 100%; display: flex; align-items: flex-end; justify-content: center;">
          <div style="width: 80%; background: #00f0ff; opacity: 0.7; height: ${(b.count / maxCount) * 100}%; min-height: 1px;"></div>
        </div>
        <div style="font-size: 9px; color: #64748b; margin-top: 2px;">${b.count}</div>
      </div>
    `).join('');
    return `
      <div style="margin-bottom: 16px;">
        <div style="color: #94a3b8; font-size: 12px; margin-bottom: 4px;">
          ${escapeHtml(label)} <span style="color: #64748b; font-family: monospace;">均值 ${hist.mean.toFixed(2)} · 标准差 ${hist.std.toFixed(2)}</span>
        </div>
        <div style="display: flex; gap: 2px; align-items: flex-end;">${bars}</div>
        <div style="display: flex; gap: 2px; margin-top: 2px;">
          ${hist.bins.map((b) => `<div style="flex: 1; text-align: center; font-size: 8px; color: #475569;">${b.range}</div>`).join('')}
        </div>
      </div>
    `;
  }).join('');

  // 相关矩阵
  const corrRows = s.dimensionCorrelation.map((c) => {
    const isHigh = Math.abs(c.r) > 0.5;
    const color = Math.abs(c.r) > 0.7 ? '#ff007f' : isHigh ? '#ffe600' : '#39ff14';
    return `
      <tr style="border-bottom: 1px solid #1a2540;">
        <td style="padding: 6px 8px; color: #94a3b8; font-size: 11px;">${escapeHtml(SCORE_LABELS[c.a])}</td>
        <td style="padding: 6px 8px; color: #94a3b8; font-size: 11px;">${escapeHtml(SCORE_LABELS[c.b])}</td>
        <td style="padding: 6px 8px; text-align: center; font-family: monospace; color: ${color};">${c.r.toFixed(3)}</td>
        <td style="padding: 6px 8px; font-size: 11px; color: ${color};">${Math.abs(c.r) > 0.7 ? '维度独立性不足' : isHigh ? '相关偏高' : '正常'}</td>
      </tr>
    `;
  }).join('');

  return `
    <h2 style="color: #00f0ff; font-family: monospace; border-bottom: 1px solid #1a2540; padding-bottom: 8px; margin-top: 32px;">B. 评分机制分析</h2>

    <h3 style="color: #94a3b8; font-size: 14px; margin-top: 20px;">B1. 16 身份分布（红旗：单一身份占比 > 15%）</h3>
    <div style="color: #64748b; font-size: 12px; margin-bottom: 8px;">
      身份熵 ${s.profileEntropy.toFixed(2)} / ${s.profileEntropyMax.toFixed(2)}（越接近最大值越均匀）
    </div>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
      <thead><tr style="background: #0a1020; color: #00f0ff; font-family: monospace; font-size: 10px;">
        <th style="padding: 6px 8px; text-align: left;">ProfileId</th>
        <th style="padding: 6px 8px;">计数</th>
        <th style="padding: 6px 8px;">占比</th>
        <th style="padding: 6px 8px;">分布</th>
      </tr></thead>
      <tbody>${profileRows}</tbody>
    </table>

    <h3 style="color: #94a3b8; font-size: 14px; margin-top: 20px;">B2. 四维归一化得分分布（0=左极 · 1=右极）</h3>
    <div style="background: #070b19; padding: 12px; border: 1px solid #1a2540; margin-bottom: 16px;">${histBlocks}</div>

    <h3 style="color: #94a3b8; font-size: 14px; margin-top: 20px;">B3. 维度间相关矩阵（红旗：|r| > 0.7 维度独立性不足）</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
      <thead><tr style="background: #0a1020; color: #00f0ff; font-family: monospace; font-size: 10px;">
        <th style="padding: 6px 8px; text-align: left;">维度A</th>
        <th style="padding: 6px 8px; text-align: left;">维度B</th>
        <th style="padding: 6px 8px;">Pearson r</th>
        <th style="padding: 6px 8px; text-align: left;">诊断</th>
      </tr></thead>
      <tbody>${corrRows}</tbody>
    </table>

    <h3 style="color: #94a3b8; font-size: 14px; margin-top: 20px;">B4. 归一化分数汇总</h3>
    <div style="background: #070b19; padding: 12px; border: 1px solid #1a2540; font-family: monospace; font-size: 12px; color: #94a3b8;">
      均值 ${s.matchScoreStats.mean.toFixed(3)} · 标准差 ${s.matchScoreStats.std.toFixed(3)} ·
      P10 ${s.matchScoreStats.p10.toFixed(3)} · P50 ${s.matchScoreStats.p50.toFixed(3)} · P90 ${s.matchScoreStats.p90.toFixed(3)} ·
      min ${s.matchScoreStats.min.toFixed(3)} · max ${s.matchScoreStats.max.toFixed(3)}
    </div>
  `;
}

function renderHtml(
  qStats: QuestionStats[],
  sStats: ScoringStats,
  meta: { inputFile: string; generatedAt: string }
): string {
  const greenCount = qStats.filter((q) => q.health === 'green').length;
  const yellowCount = qStats.filter((q) => q.health === 'yellow').length;
  const redCount = qStats.filter((q) => q.health === 'red').length;
  const worstQuestions = [...qStats].sort((a, b) => a.discrimination - b.discrimination).slice(0, 5);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>题目与评分机制分析报告</title>
  <style>
    body { background: #050814; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; }
    h1 { color: #00f0ff; font-family: 'Share Tech Mono', monospace; border-bottom: 2px solid #00f0ff; padding-bottom: 12px; }
    .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; font-family: monospace; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .card { background: #070b19; border: 1px solid #1a2540; padding: 12px; }
    .card-label { color: #64748b; font-size: 11px; text-transform: uppercase; font-family: monospace; }
    .card-value { color: #00f0ff; font-size: 22px; font-family: monospace; margin-top: 4px; }
    h2 { color: #00f0ff; font-family: monospace; border-bottom: 1px solid #1a2540; padding-bottom: 8px; margin-top: 32px; }
  </style>
</head>
<body>
  <h1>题目与评分机制分析报告</h1>
  <div class="meta">
    数据源: ${escapeHtml(meta.inputFile)} · 生成时间: ${escapeHtml(meta.generatedAt)} · 样本数: ${sStats.totalRecords}
  </div>

  <div class="summary">
    <div class="card">
      <div class="card-label">总样本</div>
      <div class="card-value">${sStats.totalRecords}</div>
    </div>
    <div class="card">
      <div class="card-label">身份熵</div>
      <div class="card-value">${sStats.profileEntropy.toFixed(2)} / ${sStats.profileEntropyMax.toFixed(2)}</div>
    </div>
    <div class="card">
      <div class="card-label">健康题数 (绿)</div>
      <div class="card-value" style="color: #39ff14;">${greenCount}</div>
    </div>
    <div class="card">
      <div class="card-label">关注题数 (黄)</div>
      <div class="card-value" style="color: #ffe600;">${yellowCount}</div>
    </div>
    <div class="card">
      <div class="card-label">问题题数 (红)</div>
      <div class="card-value" style="color: #ff007f;">${redCount}</div>
    </div>
  </div>

  <h2>A. 题目合理性分析</h2>
  <div style="color: #64748b; font-size: 12px; margin-bottom: 12px; font-family: monospace;">
    健康标准：方差 > 0.3 · 难度 [0.2, 0.8] · 熵 > 1.0 · 区分度 > 0.2 · 单选项占比 > 5%
  </div>
  ${renderQuestionTable(qStats)}

  <h3 style="color: #ff007f; font-size: 14px; margin-top: 20px;">重点关注：区分度最低的 5 道题（改写候选）</h3>
  <ul style="color: #94a3b8; font-size: 13px;">
    ${worstQuestions.map((q) => `
      <li>题 ${q.id}（${escapeHtml(dimensionMeta[q.dimension]?.label || q.dimension)}）: 区分度 ${q.discrimination.toFixed(2)} · ${q.flags.map(escapeHtml).join('；')}</li>
    `).join('')}
  </ul>

  ${renderScoringSection(sStats)}

  <div style="color: #475569; font-size: 11px; margin-top: 40px; padding-top: 12px; border-top: 1px solid #1a2540; font-family: monospace;">
    生成自 scripts/question-analysis.ts · 方法论：经典测验理论（CTT）· 样本量不足 150 时结论仅供参考
  </div>
</body>
</html>`;
}

// ============== 主入口 ==============

function parseArgs(argv: string[]): { inputPath: string; outPath: string } {
  const args = argv.slice(2);
  let inputPath = '';
  let outPath = '';
  for (const arg of args) {
    if (arg.startsWith('--in=')) inputPath = arg.slice('--in='.length);
    else if (arg.startsWith('--out=')) outPath = arg.slice('--out='.length);
  }
  if (!inputPath) {
    console.error('用法: npm run analyze:questions -- --in=<path-to-ndjson> [--out=<path-to-html>]');
    process.exit(1);
  }
  if (!outPath) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    outPath = `question-analysis-${date}.html`;
  }
  return { inputPath, outPath };
}

function main(): void {
  const { inputPath, outPath } = parseArgs(process.argv);
  console.log(`加载数据: ${inputPath}`);

  const records = loadNdjson(inputPath);
  console.log(`已加载 ${records.length} 条记录`);

  if (records.length === 0) {
    console.error('错误：无有效记录，无法分析');
    process.exit(1);
  }

  if (records.length < 30) {
    console.warn(`警告：样本量 ${records.length} < 30，统计结论不稳定，仅供参考`);
  }

  console.log('分析题目层...');
  const qStats = analyzeQuestions(records);

  console.log('分析评分层...');
  const sStats = analyzeScoring(records);

  console.log('生成 HTML 报告...');
  const html = renderHtml(qStats, sStats, {
    inputFile: inputPath,
    generatedAt: new Date().toISOString(),
  });

  const absPath = resolve(process.cwd(), outPath);
  writeFileSync(absPath, html, 'utf8');
  console.log(`\n报告已生成: ${absPath}`);

  // 控制台摘要
  console.log('\n=== 摘要 ===');
  console.log(`  样本数: ${sStats.totalRecords}`);
  console.log(`  身份熵: ${sStats.profileEntropy.toFixed(2)} / ${sStats.profileEntropyMax.toFixed(2)}`);
  console.log(`  健康/关注/问题: ${qStats.filter((q) => q.health === 'green').length} / ${qStats.filter((q) => q.health === 'yellow').length} / ${qStats.filter((q) => q.health === 'red').length}`);
  console.log(`  最差 3 题: ${[...qStats].sort((a, b) => a.discrimination - b.discrimination).slice(0, 3).map((q) => `#${q.id}(D=${q.discrimination.toFixed(2)})`).join(', ')}`);
}

main();
