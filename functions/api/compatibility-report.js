const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Content-Type-Options': 'nosniff',
};

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_KEY_PREFIX = 'rate-limit:compatibility:';
const RESULT_KEY_PREFIX = 'result:';
const SNAPSHOT_VERSION = 'snapshot-v1';
const QUESTION_VERSION = 'questions-general-2026-05';
const REPORT_VERSION = 'compatibility-v1';
const PUBLIC_SHARE_VERSION = 'public-share-v1';

const MISSION_WEIGHTS = [
  { name: '禁区探索', department: '边界署', rhythm: 0.3, strategy: 0.3, vision: 0.25, collaboration: 0.15 },
  { name: '应急响应', department: '应急局', rhythm: 0.35, strategy: 0.25, vision: 0.15, collaboration: 0.25 },
  { name: '标准审计', department: '标准局', rhythm: 0.1, strategy: 0.2, vision: 0.3, collaboration: 0.4 },
  { name: '黑市定制', department: '黑市工坊', rhythm: 0.15, strategy: 0.35, vision: 0.25, collaboration: 0.25 },
  { name: '遗迹发掘', department: '遗迹司', rhythm: 0.1, strategy: 0.25, vision: 0.35, collaboration: 0.3 },
];

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: COMMON_HEADERS });
  }

  if (request.method !== 'POST') {
    return json(
      { error: 'Method Not Allowed', code: 'BAD_REQUEST' },
      { status: 405 }
    );
  }

  const kv = getSnapshotKv(env);
  if (!kv) {
    return json(
      { error: '结果存储未配置，请先绑定 KV。', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }

  try {
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('X-Forwarded-For') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown';

    const limited = await hitRateLimit(kv, clientIp);
    if (limited) {
      return json(
        { error: '请求过于频繁，请稍后重试。', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    const payload = await request.json();
    const validationError = validateRequest(payload);
    if (validationError) {
      return json({ error: validationError, code: 'BAD_REQUEST' }, { status: 400 });
    }

    if (payload.myFriendId === payload.targetFriendId) {
      return json(
        { error: '不能和自己的结果生成互补报告。', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const [myRaw, targetRaw] = await Promise.all([
      kv.get(`${RESULT_KEY_PREFIX}${payload.myFriendId}`),
      kv.get(`${RESULT_KEY_PREFIX}${payload.targetFriendId}`),
    ]);

    if (!myRaw) {
      return json(
        { error: '当前设备的结果未找到，请重新保存你的测评结果。', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!targetRaw) {
      return json(
        { error: '好友结果未找到，可能已过期，请让好友重新生成 ID。', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const userA = JSON.parse(myRaw);
    const userB = JSON.parse(targetRaw);

    const versionError = validateSnapshotCompatibility(userA, userB);
    if (versionError) {
      return json({ error: versionError, code: 'CONFLICT' }, { status: 409 });
    }

    const report = buildCompatibilityReport(userA, userB);
    return json(report);
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : '服务器内部错误',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

export function getSnapshotKv(env) {
  return env.RESULT_SNAPSHOT_KV || env.MY_KV || null;
}

async function hitRateLimit(kv, clientIp) {
  const minuteBucket = Math.floor(Date.now() / (RATE_LIMIT_WINDOW_SECONDS * 1000));
  const key = `${RATE_LIMIT_KEY_PREFIX}${clientIp}:${minuteBucket}`;
  const current = parseInt((await kv.get(key)) || '0', 10);

  if (current >= RATE_LIMIT_MAX) {
    return true;
  }

  await kv.put(key, String(current + 1), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });

  return false;
}

function validateRequest(payload) {
  if (!payload || typeof payload !== 'object') {
    return '请求体必须为 JSON 对象。';
  }
  if (typeof payload.myFriendId !== 'string' || payload.myFriendId.length < 6) {
    return 'myFriendId 非法。';
  }
  if (typeof payload.targetFriendId !== 'string' || payload.targetFriendId.length < 6) {
    return 'targetFriendId 非法。';
  }
  return null;
}

function validateSnapshotCompatibility(userA, userB) {
  const snapshots = [userA, userB];

  for (const snapshot of snapshots) {
    if (snapshot.snapshotVersion !== SNAPSHOT_VERSION) {
      return '结果快照版本不兼容，请重新保存结果。';
    }
    if (snapshot.questionVersion !== QUESTION_VERSION) {
      return '题库版本不兼容，请重新测评并保存结果。';
    }
    if (!snapshot.normalizedScores || typeof snapshot.normalizedScores !== 'object') {
      return '结果快照缺少归一化分数。';
    }
  }

  return null;
}

function scoreByGap(delta, idealGap, tolerance, floor) {
  const raw = Math.exp(-((delta - idealGap) ** 2) / (2 * tolerance ** 2));
  return Math.round(floor + (100 - floor) * raw);
}

function coverageScore(delta, oppositeSide, avgStrength) {
  const gapFactor = Math.max(0, 1 - Math.abs(delta - 0.5) / 0.5);
  const sideBonus = oppositeSide ? 1 : 0.6;
  const strengthFactor = 0.4 + avgStrength * 0.6;
  return Math.round(100 * gapFactor * sideBonus * strengthFactor);
}

function riskScore(delta, avgStrength, dangerStart) {
  if (delta <= dangerStart) return 0;
  const overflow = (delta - dangerStart) / (1 - dangerStart);
  return Math.round(100 * overflow * (0.5 + avgStrength * 0.5));
}

function roundScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getStrength(score) {
  return Math.abs(score - 0.5) * 2;
}

function getDimensionContext(scoreA, scoreB) {
  const delta = Math.abs(scoreA - scoreB);
  const strengthA = getStrength(scoreA);
  const strengthB = getStrength(scoreB);
  return {
    delta,
    avgStrength: (strengthA + strengthB) / 2,
    oppositeSide: (scoreA - 0.5) * (scoreB - 0.5) < 0,
  };
}

function buildDimensionResult(label, delta, score) {
  let interpretation = '';

  if (score >= 75) {
    interpretation = `${label}形成稳定补位，既有差异也在可协作区间内。`;
  } else if (score >= 50) {
    interpretation = `${label}具备一定互补价值，需要在执行中做少量协调。`;
  } else if (score >= 35) {
    interpretation = `${label}存在局部补位，但协作效率容易受限。`;
  } else {
    interpretation = `${label}差异没有稳定转化为协同收益，容易带来摩擦。`;
  }

  return {
    score,
    delta: Number(delta.toFixed(2)),
    interpretation,
  };
}

function getRating(score) {
  if (score >= 80) return '完美协作';
  if (score >= 65) return '高度协作';
  if (score >= 50) return '良好协同';
  if (score >= 35) return '基本互补';
  return '显著摩擦';
}

function buildSummary(overallScore, breakdown) {
  if (overallScore >= 80) {
    return '你们既能形成明显补位，又没有被协作成本显著拖累，属于高潜力搭档组合。';
  }
  if (overallScore >= 65) {
    return '你们在关键维度上存在明确互补，只要提前对齐节奏和分工，就能稳定放大彼此长板。';
  }
  if (overallScore >= 50) {
    return '这是一组具备协同价值的组合，但需要在合作方式上做主动设计，才能把差异转化为产出。';
  }
  if (breakdown.frictionRisk >= 60) {
    return '你们不是没有互补潜力，而是执行摩擦偏高，需要更明确的接口、节奏和角色划分。';
  }
  return '你们当前的差异尚未形成有效协同，若缺少明确分工，很容易在合作中互相消耗。';
}

function buildMissionSuggestions(dimensions) {
  return MISSION_WEIGHTS.map((mission) => {
    const fitScore = roundScore(
      dimensions.rhythm.score * mission.rhythm +
        dimensions.strategy.score * mission.strategy +
        dimensions.vision.score * mission.vision +
        dimensions.collaboration.score * mission.collaboration
    );

    const strongest = Object.entries({
      节奏: dimensions.rhythm.score * mission.rhythm,
      策略: dimensions.strategy.score * mission.strategy,
      视野: dimensions.vision.score * mission.vision,
      协作: dimensions.collaboration.score * mission.collaboration,
    }).sort((a, b) => b[1] - a[1])[0][0];

    return {
      name: mission.name,
      department: mission.department,
      fitScore,
      reason: `${strongest}维度最能支撑这类任务，适合把双方差异转化为分工协同。`,
    };
  })
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 3);
}

function buildRecommendations(dimensions, breakdown, missionSuggestions) {
  const bestFor = [];
  const shouldAvoid = [];
  const communicationTips = [];

  if (dimensions.strategy.score >= 70 && dimensions.vision.score >= 70) {
    bestFor.push('一人发散探索，一人负责收敛和落地的复杂任务');
  } else if (breakdown.cognitiveComplementarity >= 65) {
    bestFor.push('需要不同视角共同参与的方案评估与决策');
  } else {
    bestFor.push('边界清晰、目标明确的小范围协作任务');
  }

  if (dimensions.collaboration.score >= 70) {
    bestFor.push('需要频繁对齐、需要同步反馈的合作场景');
  } else {
    bestFor.push('可以拆解模块、采用异步接口对齐的协作方式');
  }

  if (breakdown.frictionRisk >= 60) {
    shouldAvoid.push('没有明确角色与接口人时直接并行推进同一模块');
  }
  if (dimensions.rhythm.score < 45) {
    shouldAvoid.push('高压且需要即时同步决策的密集协作场景');
  }
  if (dimensions.collaboration.score < 45) {
    shouldAvoid.push('高频会议、持续打断式的同步合作方式');
  }
  if (shouldAvoid.length === 0) {
    shouldAvoid.push('避免在目标尚未定义清楚时就同时深入执行细节');
  }

  if (dimensions.rhythm.score < 55) {
    communicationTips.push('先约定节奏预期：谁先出稿、谁负责收敛、何时做同步决策。');
  } else {
    communicationTips.push('保持固定节奏的短周期同步，能放大你们的协作效率。');
  }

  if (dimensions.collaboration.score < 55) {
    communicationTips.push('优先使用异步文档和明确接口，减少彼此打断带来的消耗。');
  } else {
    communicationTips.push('适当提高高频对齐密度，会让你们更容易形成合拍推进。');
  }

  if (breakdown.blindSpotCoverage >= 65) {
    communicationTips.push('在关键节点刻意邀请对方审视你的盲区，比单独推进更能提升质量。');
  } else {
    communicationTips.push('先明确各自负责的边界，再逐步建立互补默契。');
  }

  return {
    bestFor,
    shouldAvoid,
    communicationTips,
    missionSuggestions,
  };
}

export function buildCompatibilityReport(userA, userB) {
  const a = userA.normalizedScores;
  const b = userB.normalizedScores;

  const rhythmContext = getDimensionContext(a.impulsiveReflective, b.impulsiveReflective);
  const strategyContext = getDimensionContext(a.convergentDivergent, b.convergentDivergent);
  const visionContext = getDimensionContext(a.wholisticAnalytic, b.wholisticAnalytic);
  const collaborationContext = getDimensionContext(a.soloTeam, b.soloTeam);

  const rhythmScore = scoreByGap(rhythmContext.delta, 0.35, 0.2, 35);
  const strategyScore = scoreByGap(strategyContext.delta, 0.6, 0.22, 20);
  const visionScore = scoreByGap(visionContext.delta, 0.55, 0.28, 30);
  const collaborationScore = scoreByGap(collaborationContext.delta, 0.1, 0.18, 15);

  const cognitiveComplementarity = roundScore(
    rhythmScore * 0.3 + strategyScore * 0.35 + visionScore * 0.35
  );
  const collaborationCompatibility = collaborationScore;
  const blindSpotCoverage = roundScore(
    (
      coverageScore(rhythmContext.delta, rhythmContext.oppositeSide, rhythmContext.avgStrength) +
      coverageScore(strategyContext.delta, strategyContext.oppositeSide, strategyContext.avgStrength) +
      coverageScore(visionContext.delta, visionContext.oppositeSide, visionContext.avgStrength)
    ) / 3
  );
  const frictionRisk = roundScore(
    riskScore(rhythmContext.delta, rhythmContext.avgStrength, 0.6) * 0.45 +
      riskScore(collaborationContext.delta, collaborationContext.avgStrength, 0.5) * 0.35 +
      riskScore(strategyContext.delta, strategyContext.avgStrength, 0.85) * 0.1 +
      riskScore(visionContext.delta, visionContext.avgStrength, 0.9) * 0.1
  );

  const overallScore = roundScore(
    cognitiveComplementarity * 0.45 +
      collaborationCompatibility * 0.2 +
      blindSpotCoverage * 0.2 +
      (100 - frictionRisk) * 0.15
  );

  const dimensions = {
    rhythm: buildDimensionResult('节奏维度', rhythmContext.delta, rhythmScore),
    strategy: buildDimensionResult('策略维度', strategyContext.delta, strategyScore),
    vision: buildDimensionResult('视野维度', visionContext.delta, visionScore),
    collaboration: buildDimensionResult('协作维度', collaborationContext.delta, collaborationScore),
  };

  const missionSuggestions = buildMissionSuggestions(dimensions);
  const breakdown = {
    cognitiveComplementarity,
    collaborationCompatibility,
    blindSpotCoverage,
    frictionRisk,
  };

  return {
    reportVersion: REPORT_VERSION,
    generatedAt: Date.now(),
    pair: {
      userA: {
        friendId: userA.friendId,
        profileId: userA.profileId,
        displayName: userA.display.displayName,
        callSign: userA.display.callSign,
        department: userA.display.department,
        rank: userA.display.rank,
        avatar: userA.display.avatar,
      },
      userB: {
        friendId: userB.friendId,
        profileId: userB.profileId,
        displayName: userB.display.displayName,
        callSign: userB.display.callSign,
        department: userB.display.department,
        rank: userB.display.rank,
        avatar: userB.display.avatar,
      },
    },
    overall: {
      score: overallScore,
      rating: getRating(overallScore),
      summary: buildSummary(overallScore, breakdown),
    },
    breakdown,
    dimensions,
    recommendations: buildRecommendations(dimensions, breakdown, missionSuggestions),
  };
}

export function buildPublicCompatibilityReport(report, token, expiresAt) {
  return {
    token,
    createdAt: Date.now(),
    expiresAt,
    reportVersion: PUBLIC_SHARE_VERSION,
    overall: report.overall,
    breakdown: report.breakdown,
    dimensions: report.dimensions,
    recommendations: report.recommendations,
  };
}

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...COMMON_HEADERS,
      ...(init.headers || {}),
    },
  });
}
