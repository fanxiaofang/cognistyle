import { buildCompatibilityReport } from '../functions/api/compatibility-report.js';
import { dimensionMeta, questionsGeneral } from '../src/data/questions';

type NormalizedScores = {
  impulsiveReflective: number;
  convergentDivergent: number;
  wholisticAnalytic: number;
  soloTeam: number;
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

function scoreLabel(score: number) {
  if (score >= 80) return '王牌';
  if (score >= 65) return '合拍';
  if (score >= 50) return '适配';
  if (score >= 35) return '可期';
  return '磨合';
}

const fixedSamples: FixedSample[] = [
  {
    name: 'homogeneous-clone',
    description: '完全相似型：验证同质组合是否被压出 workable 主峰。',
    a: makeSnapshot('clone-a', 'I-C-W-T', {
      impulsiveReflective: 0.3,
      convergentDivergent: 0.25,
      wholisticAnalytic: 0.35,
      soloTeam: 0.6,
    }),
    b: makeSnapshot('clone-b', 'I-C-W-T', {
      impulsiveReflective: 0.3,
      convergentDivergent: 0.25,
      wholisticAnalytic: 0.35,
      soloTeam: 0.6,
    }),
  },
  {
    name: 'balanced-complement',
    description: '适度互补型：验证策略/视野差异能否拉开到 50+。',
    a: makeSnapshot('balance-a', 'I-C-W-T', {
      impulsiveReflective: 0.32,
      convergentDivergent: 0.2,
      wholisticAnalytic: 0.28,
      soloTeam: 0.55,
    }),
    b: makeSnapshot('balance-b', 'R-D-A-T', {
      impulsiveReflective: 0.67,
      convergentDivergent: 0.7,
      wholisticAnalytic: 0.72,
      soloTeam: 0.48,
    }),
  },
  {
    name: 'high-complement-high-friction',
    description: '高互补高摩擦型：验证中高差异不会被误判成高分。',
    a: makeSnapshot('friction-a', 'I-C-W-S', {
      impulsiveReflective: 0.15,
      convergentDivergent: 0.15,
      wholisticAnalytic: 0.25,
      soloTeam: 0.15,
    }),
    b: makeSnapshot('friction-b', 'R-D-A-T', {
      impulsiveReflective: 0.82,
      convergentDivergent: 0.78,
      wholisticAnalytic: 0.7,
      soloTeam: 0.82,
    }),
  },
  {
    name: 'extreme-opposition',
    description: '极端对立型：验证强冲突是否稳定落入低分段。',
    a: makeSnapshot('extreme-a', 'I-C-W-S', {
      impulsiveReflective: 0.0,
      convergentDivergent: 0.0,
      wholisticAnalytic: 0.0,
      soloTeam: 0.0,
    }),
    b: makeSnapshot('extreme-b', 'R-D-A-T', {
      impulsiveReflective: 1.0,
      convergentDivergent: 1.0,
      wholisticAnalytic: 1.0,
      soloTeam: 1.0,
    }),
  },
  {
    name: 'workable-borderline',
    description: '临界中档型：验证 workable 是否只保留给少量边界组合。',
    a: makeSnapshot('border-a', 'I-C-A-T', {
      impulsiveReflective: 0.42,
      convergentDivergent: 0.3,
      wholisticAnalytic: 0.58,
      soloTeam: 0.52,
    }),
    b: makeSnapshot('border-b', 'R-C-W-T', {
      impulsiveReflective: 0.6,
      convergentDivergent: 0.26,
      wholisticAnalytic: 0.34,
      soloTeam: 0.58,
    }),
  },
];

function runFixedSamples() {
  console.log('=== 固定样本验证 ===');
  for (const sample of fixedSamples) {
    const report = buildCompatibilityReport(sample.a as any, sample.b as any);
    console.log(`\n[${sample.name}] ${sample.description}`);
    console.log(`总分 ${report.overall.score} (${scoreLabel(report.overall.score)})`);
    console.log(
      `拆解: 认知 ${report.breakdown.cognitiveComplementarity}, 协作 ${report.breakdown.collaborationCompatibility}, 盲区 ${report.breakdown.blindSpotCoverage}, 风险 ${report.breakdown.frictionRisk}`
    );
    console.log(
      `维度: 节奏 ${report.dimensions.rhythm.score}/${report.dimensions.rhythm.delta}, 策略 ${report.dimensions.strategy.score}/${report.dimensions.strategy.delta}, 视野 ${report.dimensions.vision.score}/${report.dimensions.vision.delta}, 协作 ${report.dimensions.collaboration.score}/${report.dimensions.collaboration.delta}`
    );
  }
}

function buildNormalizedScoresFromAnswers(answers: AnswerMap): NormalizedScores {
  const scoreMap: Record<string, number> = {};
  const dimQuestionsCount: Record<string, number> = {};

  questionsGeneral.forEach((question) => {
    const userAnswer = answers[question.id] ?? 3;
    const meta = dimensionMeta[question.dimension];

    const points =
      question.direction === meta.rightPolarity.key ? (userAnswer - 1) * 1.25 : (5 - userAnswer) * 1.25;

    scoreMap[question.dimension] = (scoreMap[question.dimension] ?? 0) + points;
    dimQuestionsCount[question.dimension] = (dimQuestionsCount[question.dimension] ?? 0) + 1;
  });

  const normalizedByDimension = Object.fromEntries(
    Object.keys(dimQuestionsCount).map((dimensionId) => {
      const count = dimQuestionsCount[dimensionId];
      const maxScore = count * 5;
      const rawScore = scoreMap[dimensionId] ?? maxScore / 2;
      const percentage = maxScore > 0 ? (rawScore / maxScore) * 100 : 50;
      return [dimensionId, Math.round(percentage) / 100];
    })
  );

  return {
    impulsiveReflective: normalizedByDimension.impulsive_reflective ?? 0.5,
    convergentDivergent: normalizedByDimension.convergent_divergent ?? 0.5,
    wholisticAnalytic: normalizedByDimension.wholistic_analytic ?? 0.5,
    soloTeam: normalizedByDimension.solo_team ?? 0.5,
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
    low: 0,
    basic: 0,
    workable: 0,
    strong: 0,
    excellent: 0,
  };
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

    if (score < 35) bins.low += 1;
    else if (score < 50) bins.basic += 1;
    else if (score < 65) bins.workable += 1;
    else if (score < 80) bins.strong += 1;
    else bins.excellent += 1;
  }

  const percent = (count: number) => `${((count / iterations) * 100).toFixed(1)}%`;

  console.log('\n=== 随机分布模拟 ===');
  console.log(`样本量: ${iterations}`);
  console.log(`平均分: ${(sum / iterations).toFixed(1)} | 最低分: ${min} | 最高分: ${max}`);
  console.log(`0-34   探索磨合: ${percent(bins.low)}`);
  console.log(`35-49  潜力搭档: ${percent(bins.basic)}`);
  console.log(`50-64  良好协同: ${percent(bins.workable)}`);
  console.log(`65-79  合拍: ${percent(bins.strong)}`);
  console.log(`80-100 王牌: ${percent(bins.excellent)}`);
}

runFixedSamples();
runDistributionSimulation();
