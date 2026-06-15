// 实验：问卷 profile 分布
// 生成 100,000 个随机答题 profile，统计 4 个维度的分布
// 如果 p10 > 0.3 且 p90 < 0.7，说明问卷没有把人拉开 → compatibility 怎么调都没用

import { dimensionMeta, questionsGeneral } from '../src/data/questions';

type AnswerMap = Record<number, number>;

function randomAnswers(): AnswerMap {
  const answers: AnswerMap = {};
  questionsGeneral.forEach((q) => {
    answers[q.id] = 1 + Math.floor(Math.random() * 5);
  });
  return answers;
}

function buildProfile(answers: AnswerMap) {
  const scoreMap: Record<string, number> = {};
  const dimQuestionsCount: Record<string, number> = {};

  const validDims = new Set<string>();
  const skippedDims = new Set<string>();

  questionsGeneral.forEach((q) => {
    const meta = dimensionMeta[q.dimension];
    if (!meta) {
      skippedDims.add(q.dimension);
      return;
    }
    validDims.add(q.dimension);

    const userAnswer = answers[q.id] ?? 3;
    const points =
      q.direction === meta.rightPolarity.key
        ? (userAnswer - 1) * 1.25
        : (5 - userAnswer) * 1.25;

    scoreMap[q.dimension] = (scoreMap[q.dimension] ?? 0) + points;
    dimQuestionsCount[q.dimension] = (dimQuestionsCount[q.dimension] ?? 0) + 1;
  });

  const normalize = (dimensionId: string): number => {
    const count = dimQuestionsCount[dimensionId] ?? 0;
    if (count === 0) return 0.5; // 没有题目 → 默认中立
    const maxScore = count * 5;
    const rawScore = scoreMap[dimensionId] ?? maxScore / 2;
    const percentage = maxScore > 0 ? (rawScore / maxScore) * 100 : 50;
    return Math.round(percentage) / 100;
  };

  return {
    field:  normalize('fieldIndepend_fieldDepend'),
    vision: normalize('wholistic_analytic'),
    direction: normalize('exploratory_directed'),
    rhythm: normalize('impulsive_reflective'),
    _validDims: Array.from(validDims),
    _skippedDims: Array.from(skippedDims),
    _dimCounts: Object.fromEntries(
      Array.from(validDims).map(d => [d, dimQuestionsCount[d]])
    ),
  };
}

const ITERATIONS = 100000;

const dims = ['field', 'vision', 'direction', 'rhythm'] as const;
const buckets: Record<(typeof dims)[number], number[]> = {
  field: [],
  vision: [],
  direction: [],
  rhythm: [],
};

const firstSkipped = new Set<string>();

for (let i = 0; i < ITERATIONS; i++) {
  const profile = buildProfile(randomAnswers());
  for (const dim of dims) {
    buckets[dim].push(profile[dim]);
  }
  if (i === 0) {
    console.log(`维度映射 (总题量: ${questionsGeneral.length}):`);
    console.log('  各维度题量:', profile._dimCounts);
    for (const dim of dims) {
      console.log(`  ${dim}: ${profile[dim]}`);
    }
    console.log('---');
  }
}

console.log(`\n=== 问卷 profile 分布 (n=${ITERATIONS}) ===`);
console.log('维度          avg     std     p10     p25     p50     p75     p90     min     max');

for (const dim of dims) {
  const sorted = [...buckets[dim]].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((s, v) => s + v, 0) / n;
  const variance = sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const p10 = sorted[Math.floor(n * 0.1)];
  const p25 = sorted[Math.floor(n * 0.25)];
  const p50 = sorted[Math.floor(n * 0.5)];
  const p75 = sorted[Math.floor(n * 0.75)];
  const p90 = sorted[Math.floor(n * 0.9)];
  const min = sorted[0];
  const max = sorted[n - 1];

  const label = dim.padEnd(12);
  console.log(
    `${label} ${mean.toFixed(3)}  ${std.toFixed(3)}   ${p10.toFixed(3)}  ${p25.toFixed(3)}  ${p50.toFixed(3)}  ${p75.toFixed(3)}  ${p90.toFixed(3)}  ${min.toFixed(3)}  ${max.toFixed(3)}`
  );

  // 判定信号
  const p10ok = p10 < 0.3 ? '✓ 左尾 OK' : '✗ p10>' + p10.toFixed(2) + ' → 太趋中';
  const p90ok = p90 > 0.7 ? '✓ 右尾 OK' : '✗ p90<' + p90.toFixed(2) + ' → 太趋中';
  console.log(`  ${p10ok}  ${p90ok}`);
}

console.log('\n--- 结论 ---');
const allCentered = dims.every((dim) => {
  const sorted = [...buckets[dim]].sort((a, b) => a - b);
  const p10 = sorted[Math.floor(sorted.length * 0.1)];
  const p90 = sorted[Math.floor(sorted.length * 0.9)];
  return p10 > 0.3 && p90 < 0.7;
});

if (allCentered) {
  console.log('⚠ 所有维度的 p10 > 0.3 且 p90 < 0.7');
  console.log('  → 问卷没有把人拉开 → compatibility 怎么调都没用');
  console.log('  → 需要先修复问卷的区分度（增加题目数 / 调整计分方式）');
} else {
  const problems = dims.filter((dim) => {
    const sorted = [...buckets[dim]].sort((a, b) => a - b);
    const p10 = sorted[Math.floor(sorted.length * 0.1)];
    const p90 = sorted[Math.floor(sorted.length * 0.9)];
    return p10 > 0.3 && p90 < 0.7;
  });
  if (problems.length > 0) {
    console.log(`⚠ 以下维度区间过窄: ${problems.join(', ')}`);
  } else {
    console.log('✓ 所有维度分布正常，问题不在问卷');
  }
}
