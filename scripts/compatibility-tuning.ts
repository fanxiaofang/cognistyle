import { buildCompatibilityReport } from '../functions/api/compatibility-report.js';
import { dimensionMeta, questionsGeneral } from '../src/data/questions';

// v5.6: 4 维 = 3 核心(F/V/D) + 1 风格(R)
type NormalizedScores = {
  fieldIndependFieldDepend: number;
  wholisticAnalytic: number;
  exploratoryDirected: number;
  impulsiveReflective: number;
};

type SnapshotLike = {
  friendId: string;
  profileId: string;
  normalizedScores: NormalizedScores;
  display?: {
    displayName?: string;
    callSign?: string;
    department?: string;
    rank?: string;
    avatar?: string;
  };
};

type FixedSample = {
  name: string;
  description: string;
  a: SnapshotLike;
  b: SnapshotLike;
};

type AnswerMap = Record<number, number>;

function makeSnapshot(
  friendId: string,
  profileId: string,
  normalizedScores: NormalizedScores
): SnapshotLike {
  return {
    friendId,
    profileId,
    normalizedScores,
    display: {
      displayName: friendId,
      callSign: friendId.toUpperCase(),
      department: '测试部',
      rank: '调参样本',
      avatar: 'A',
    },
  };
}

// v6.1: 分数区间标签
function scoreLabel(score: number) {
  if (score >= 80) return '默契';
  if (score >= 65) return '共振';
  if (score >= 50) return '互补';
  if (score >= 35) return '探索';
  return '挑战';
}

const fixedSamples: FixedSample[] = [
  {
    name: 'homogeneous-clone',
    description: '完全同质型（回声组）：验证 alignment bonus 是否将同质组合拉入中高分。',
    a: makeSnapshot('clone-a', 'FI-D-W-I', {
      fieldIndependFieldDepend: 0.30,
      wholisticAnalytic: 0.35,
      exploratoryDirected: 0.25,
      impulsiveReflective: 0.30,
    }),
    b: makeSnapshot('clone-b', 'FI-D-W-I', {
      fieldIndependFieldDepend: 0.30,
      wholisticAnalytic: 0.35,
      exploratoryDirected: 0.25,
      impulsiveReflective: 0.30,
    }),
  },
  {
    name: 'balanced-complement',
    description: '适度互补型（经纬组）：验证盲区覆盖 + 认知互补能否打到高分。',
    a: makeSnapshot('balance-a', 'FI-D-W-I', {
      fieldIndependFieldDepend: 0.20,
      wholisticAnalytic: 0.28,
      exploratoryDirected: 0.25,
      impulsiveReflective: 0.32,
    }),
    b: makeSnapshot('balance-b', 'FD-E-A-R', {
      fieldIndependFieldDepend: 0.72,
      wholisticAnalytic: 0.72,
      exploratoryDirected: 0.70,
      impulsiveReflective: 0.67,
    }),
  },
  {
    name: 'high-complement-high-friction',
    description: '高互补高摩擦型（化学反应组）：验证高差异不被误判成高分。',
    a: makeSnapshot('friction-a', 'FI-E-A-I', {
      fieldIndependFieldDepend: 0.15,
      wholisticAnalytic: 0.25,
      exploratoryDirected: 0.15,
      impulsiveReflective: 0.15,
    }),
    b: makeSnapshot('friction-b', 'FD-D-A-R', {
      fieldIndependFieldDepend: 0.82,
      wholisticAnalytic: 0.70,
      exploratoryDirected: 0.78,
      impulsiveReflective: 0.82,
    }),
  },
  {
    name: 'extreme-opposition',
    description: '极端对立型（化学反应组）：验证强冲突是否稳定落入最低分。',
    a: makeSnapshot('extreme-a', 'FI-D-W-I', {
      fieldIndependFieldDepend: 0.0,
      wholisticAnalytic: 0.0,
      exploratoryDirected: 0.0,
      impulsiveReflective: 0.0,
    }),
    b: makeSnapshot('extreme-b', 'FD-E-A-R', {
      fieldIndependFieldDepend: 1.0,
      wholisticAnalytic: 1.0,
      exploratoryDirected: 1.0,
      impulsiveReflective: 1.0,
    }),
  },
  {
    name: 'workable-borderline',
    description: '临界中档型（双星共轨组）：验证兜底组合是否合理。',
    a: makeSnapshot('border-a', 'FI-D-A-I', {
      fieldIndependFieldDepend: 0.42,
      wholisticAnalytic: 0.58,
      exploratoryDirected: 0.30,
      impulsiveReflective: 0.42,
    }),
    b: makeSnapshot('border-b', 'FI-D-W-R', {
      fieldIndependFieldDepend: 0.58,
      wholisticAnalytic: 0.34,
      exploratoryDirected: 0.26,
      impulsiveReflective: 0.60,
    }),
  },
];

function runFixedSamples() {
  console.log('=== v6 固定样本验证 (含 P2 coverage 拆解) ===');
  for (const sample of fixedSamples) {
    const report = buildCompatibilityReport(sample.a as any, sample.b as any);
    console.log(`\n[${sample.name}] ${sample.description}`);
    console.log(`搭档指数 ${report.overall.score} (${scoreLabel(report.overall.score)}) | 模式: ${report.overall.pattern} | badge: ${report.overall.patternBadge.label}`);
    console.log(
      `拆解: 认知 ${report.breakdown.cognitiveComplementarity}, 盲区 ${report.breakdown.blindSpotCoverage}, 摩擦 ${report.breakdown.frictionRisk}, 节奏 ${report.breakdown.rhythmSynergy}`
    );
    console.log(
      `维度: 场定位 ${report.dimensions.field.score}/${report.dimensions.field.delta}, 方向 ${report.dimensions.direction.score}/${report.dimensions.direction.delta}, 视野 ${report.dimensions.vision.score}/${report.dimensions.vision.delta}, 节奏 ${report.dimensions.rhythm.score}/${report.dimensions.rhythm.delta}`
    );
    // P2 coverage 拆解
    if (report._coverageDebug) {
      console.log('coverage 拆解:');
      for (const [key, dbg] of Object.entries(report._coverageDebug)) {
        const d = dbg as { delta: number; oppositeSide: boolean; coveragePotential: number; strengthFactor: number; rawCoverage: number };
        console.log(`  ${key}: Δ=${d.delta} oppSide=${d.oppositeSide} covPot=${d.coveragePotential} strF=${d.strengthFactor} raw=${d.rawCoverage}`);
      }
    }
  }
}

// v5.6: 将答题数据映射到新的四维归一化分数
// 注意：questions.ts 中的 dimension ID 可能与 types.ts 不同，此处做兼容映射
function buildNormalizedScoresFromAnswers(answers: AnswerMap): NormalizedScores {
  const scoreMap: Record<string, number> = {};
  const dimQuestionsCount: Record<string, number> = {};

  questionsGeneral.forEach((question) => {
    const userAnswer = answers[question.id] ?? 3;
    const meta = dimensionMeta[question.dimension];
    if (!meta) return; // skip unknown dimensions

    const points =
      question.direction === meta.rightPolarity.key
        ? (userAnswer - 1) * 1.25
        : (5 - userAnswer) * 1.25;

    scoreMap[question.dimension] = (scoreMap[question.dimension] ?? 0) + points;
    dimQuestionsCount[question.dimension] = (dimQuestionsCount[question.dimension] ?? 0) + 1;
  });

  const normalize = (dimensionId: string): number => {
    const count = dimQuestionsCount[dimensionId] ?? 0;
    if (count === 0) return 0.5;
    const maxScore = count * 5;
    const rawScore = scoreMap[dimensionId] ?? maxScore / 2;
    const percentage = maxScore > 0 ? (rawScore / maxScore) * 100 : 50;
    return Math.round(percentage) / 100;
  };

  return {
    // 核心三维
    fieldIndependFieldDepend: normalize('fieldIndepend_fieldDepend'),
    wholisticAnalytic: normalize('wholistic_analytic'),
    exploratoryDirected: normalize('exploratory_directed'),
    // 风格标签（节奏）
    impulsiveReflective: normalize('impulsive_reflective'),
  };
}

function randomAnswers(): AnswerMap {
  const answers: AnswerMap = {};
  questionsGeneral.forEach((question) => {
    answers[question.id] = 1 + Math.floor(Math.random() * 5);
  });
  return answers;
}

function randomSnapshot(id: string): SnapshotLike {
  return makeSnapshot(id, 'RANDOM', buildNormalizedScoresFromAnswers(randomAnswers()));
}

function runDistributionSimulation(iterations = 50000) {
  const bins = {
    dynamic: 0,       // 0-39   挑战
    exploratory: 0,   // 40-54  探索
    complementary: 0, // 55-69  互补
    synergistic: 0,   // 70-84  共振
    harmonious: 0,    // 85-100 默契
  };
  const patternBins = {
    homogeneous: 0,
    complementary: 0,
    asymmetric: 0,
    conflicting: 0,
  };
  // 子分监控：收集所有值用于统计
  const subScores = {
    cognitiveComplementarity: [] as number[],
    blindSpotCoverage: [] as number[],
    frictionRisk: [] as number[],
    rhythmSynergy: [] as number[],
  };
  // P2 coverage 按维度拆解
  const covDeltas: Record<string, number[]> = { field: [], vision: [], direction: [] };
  const covPots: Record<string, number[]> = { field: [], vision: [], direction: [] };
  const covStrF: Record<string, number[]> = { field: [], vision: [], direction: [] };
  const covRaws: Record<string, number[]> = { field: [], vision: [], direction: [] };
  let covOppSideCount = 0; // 同侧 vs 异侧计数
  let covSameSideCount = 0;
  let min = 100;
  let max = 0;
  let sum = 0;

  for (let index = 0; index < iterations; index += 1) {
    const report = buildCompatibilityReport(
      randomSnapshot(`sim-a-${index}`) as any,
      randomSnapshot(`sim-b-${index}`) as any
    );
    const score = report.overall.score;
    min = Math.min(min, score);
    max = Math.max(max, score);
    sum += score;

    if (score < 35) bins.dynamic += 1;
    else if (score < 50) bins.exploratory += 1;
    else if (score < 65) bins.complementary += 1;
    else if (score < 80) bins.synergistic += 1;
    else bins.harmonious += 1;

    patternBins[report.overall.pattern as keyof typeof patternBins] += 1;

    subScores.cognitiveComplementarity.push(report.breakdown.cognitiveComplementarity);
    subScores.blindSpotCoverage.push(report.breakdown.blindSpotCoverage);
    subScores.frictionRisk.push(report.breakdown.frictionRisk);
    subScores.rhythmSynergy.push(report.breakdown.rhythmSynergy);

    // P2: collect coverage dimension-level data
    if (report._coverageDebug) {
      for (const [key, dbg] of Object.entries(report._coverageDebug)) {
        const d = dbg as { delta: number; oppositeSide: boolean; coveragePotential: number; strengthFactor: number; rawCoverage: number };
        covDeltas[key]?.push(d.delta);
        covPots[key]?.push(d.coveragePotential);
        covStrF[key]?.push(d.strengthFactor);
        covRaws[key]?.push(d.rawCoverage);
        if (d.oppositeSide) covOppSideCount++; else covSameSideCount++;
      }
    }
  }

  const percent = (count: number) => `${((count / iterations) * 100).toFixed(1)}%`;

  console.log('\n=== v5.6 随机分布模拟 ===');
  console.log(`样本量: ${iterations}`);
  console.log(`平均分: ${(sum / iterations).toFixed(1)} | 最低分: ${min} | 最高分: ${max}`);
  console.log(`0 - 34   挑战: ${percent(bins.dynamic)}`);
  console.log(`35 - 49  探索: ${percent(bins.exploratory)}`);
  console.log(`50 - 64  互补: ${percent(bins.complementary)}`);
  console.log(`65 - 79  共振: ${percent(bins.synergistic)}`);
  console.log(`80 - 100 默契: ${percent(bins.harmonious)}`);

  console.log('\n--- Pattern 分布 ---');
  console.log(`homogeneous:   ${percent(patternBins.homogeneous)}`);
  console.log(`complementary: ${percent(patternBins.complementary)}`);
  console.log(`asymmetric:    ${percent(patternBins.asymmetric)}`);
  console.log(`conflicting:   ${percent(patternBins.conflicting)}`);

  console.log('\n--- 子分监控 (mean / std / p10 / p50 / p90 / max) ---');
  const stats = (label: string, arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = sorted.reduce((s, v) => s + v, 0) / n;
    const variance = sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);
    const p10 = sorted[Math.floor(n * 0.1)];
    const p50 = sorted[Math.floor(n * 0.5)];
    const p90 = sorted[Math.floor(n * 0.9)];
    const maxVal = sorted[n - 1];
    console.log(`${label.padEnd(28)} avg ${mean.toFixed(1)}  std ${std.toFixed(1)}  p10 ${p10}  p50 ${p50}  p90 ${p90}  max ${maxVal}`);
  };
  stats('cognitiveComplementarity', subScores.cognitiveComplementarity);
  stats('blindSpotCoverage', subScores.blindSpotCoverage);
  stats('frictionRisk', subScores.frictionRisk);
  stats('rhythmSynergy', subScores.rhythmSynergy);

  // P2: coverage 按维度拆解统计
  console.log('\n--- P2 coverage 维度拆解 ---');
  const dimNames: Record<string, string> = { field: '场定位', vision: '视野', direction: '方向' };
  console.log(`  oppositeSide 异侧: ${covOppSideCount} (${((covOppSideCount / (iterations * 3)) * 100).toFixed(1)}%)  同侧: ${covSameSideCount} (${((covSameSideCount / (iterations * 3)) * 100).toFixed(1)}%)`);
  for (const dim of ['field', 'vision', 'direction']) {
    const label = dimNames[dim] || dim;
    stats(`  ${label} delta`, covDeltas[dim]);
    stats(`  ${label} covPot`, covPots[dim]);
    stats(`  ${label} strF`, covStrF[dim]);
    stats(`  ${label} raw`, covRaws[dim]);
  }
}

runFixedSamples();
runDistributionSimulation();
