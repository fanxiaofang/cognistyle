import {
  COMPATIBILITY_CONFIG,
  COMPATIBILITY_COPY,
  DEFAULT_LOCALE,
} from './compatibility-report.config.js';
import {
  API_VERSIONS,
  KV_KEY_PREFIXES,
  DEFAULT_RATE_LIMIT,
  TTL,
  VALIDATION_RULES,
  COMMON_HEADERS,
} from './shared/api-constants.js';
import {
  getSnapshotKv,
  hitRateLimit,
  extractClientIp,
  generateUrlSafeToken,
  json,
  safeParseJson,
  validateFriendIdFormat,
} from './shared/api-utils.js';

const copy = COMPATIBILITY_COPY[DEFAULT_LOCALE];

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: COMMON_HEADERS });
  }

  if (request.method !== 'POST') {
    return json(
      { error: 'Method Not Allowed', code: 'BAD_REQUEST' },
      COMMON_HEADERS,
      { status: 405 }
    );
  }

  const kv = getSnapshotKv(env);
  if (!kv) {
    console.warn('[compatibility] KV 存储未绑定');
    return json(
      { error: copy.errors.storageMissing, code: 'INTERNAL_ERROR' },
      COMMON_HEADERS,
      { status: 500 }
    );
  }

  console.log('[compatibility] KV 来源:', kv.__source || 'unknown');

  try {
    const clientIp = extractClientIp(request);
    const limited = await hitRateLimit(
      kv,
      clientIp,
      KV_KEY_PREFIXES.RATE_LIMIT.COMPATIBILITY,
      DEFAULT_RATE_LIMIT.COMPATIBILITY_MAX
    );
    if (limited) {
      return json(
        { error: copy.errors.rateLimited, code: 'RATE_LIMITED' },
        COMMON_HEADERS,
        { status: 429 }
      );
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(
        { error: '请求体 JSON 解析失败', code: 'BAD_REQUEST' },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    const validationError = validateRequest(payload);
    if (validationError) {
      return json(
        { error: validationError, code: 'BAD_REQUEST' },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    if (payload.myFriendId === payload.targetFriendId) {
      return json(
        { error: copy.errors.selfPair, code: 'BAD_REQUEST' },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    const [myRaw, targetRaw] = await Promise.all([
      kv.get(`${KV_KEY_PREFIXES.RESULT}${payload.myFriendId}`),
      kv.get(`${KV_KEY_PREFIXES.RESULT}${payload.targetFriendId}`),
    ]);

    if (!myRaw) {
      return json(
        { error: copy.errors.currentResultMissing, code: 'NOT_FOUND' },
        COMMON_HEADERS,
        { status: 404 }
      );
    }

    if (!targetRaw) {
      return json(
        { error: copy.errors.targetResultMissing, code: 'NOT_FOUND' },
        COMMON_HEADERS,
        { status: 404 }
      );
    }

    const userA = safeParseJson(myRaw);
    const userB = safeParseJson(targetRaw);

    console.log('[compatibility:read]', {
      myFriendId: payload.myFriendId,
      userA: {
        profileId: userA?.profileId,
        displayName: userA?.display?.displayName,
        normalizedScores: userA?.normalizedScores,
      },
      targetFriendId: payload.targetFriendId,
      userB: {
        profileId: userB?.profileId,
        displayName: userB?.display?.displayName,
        normalizedScores: userB?.normalizedScores,
      },
    });

    if (!userA || !userB) {
      return json(
        { error: copy.errors.snapshotVersionMismatch, code: 'CONFLICT' },
        COMMON_HEADERS,
        { status: 409 }
      );
    }

    const versionError = validateSnapshotCompatibility(userA, userB);
    if (versionError) {
      return json(
        { error: versionError, code: 'CONFLICT' },
        COMMON_HEADERS,
        { status: 409 }
      );
    }

    const scoresError = validateNormalizedScores(userA.normalizedScores, userB.normalizedScores);
    if (scoresError) {
      return json(
        { error: scoresError, code: 'BAD_REQUEST' },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    const report = buildCompatibilityReport(userA, userB);
    const reportId = generateUrlSafeToken(16);

    kv.put(
      `${KV_KEY_PREFIXES.ANALYTICS.DUAL}${reportId}`,
      JSON.stringify({
        reportId,
        createdAt: Date.now(),
        myFriendId: payload.myFriendId,
        targetFriendId: payload.targetFriendId,
        overall: report.overall.score,
        pattern: report.overall.pattern,
        breakdown: report.breakdown,
        dimensionPatterns: Object.fromEntries(
          Object.entries(report.dimensions).map(([key, dim]) => [key, dim.pattern])
        ),
        reportVersion: report.reportVersion,
      }),
      { expirationTtl: TTL.SNAPSHOT_SECONDS }
    ).catch((err) => {
      console.warn('[compatibility] analytics write failed:', err.message);
    });

    return json({ ...report, reportId }, COMMON_HEADERS);
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : copy.errors.internalError,
        code: 'INTERNAL_ERROR',
      },
      COMMON_HEADERS,
      { status: 500 }
    );
  }
}

export { getSnapshotKv, safeParseJson };

function validateRequest(payload) {
  if (!payload || typeof payload !== 'object') {
    return copy.errors.requestBodyMustBeObject;
  }
  if (!validateFriendIdFormat(payload.myFriendId)) {
    return copy.errors.invalidMyFriendId;
  }
  if (!validateFriendIdFormat(payload.targetFriendId)) {
    return copy.errors.invalidTargetFriendId;
  }
  return null;
}

function validateSnapshotCompatibility(userA, userB) {
  const snapshots = [userA, userB];

  for (const snapshot of snapshots) {
    if (snapshot.snapshotVersion !== API_VERSIONS.SNAPSHOT_VERSION) {
      return copy.errors.snapshotVersionMismatch;
    }
    if (snapshot.questionVersion !== API_VERSIONS.QUESTION_VERSION) {
      return copy.errors.questionVersionMismatch;
    }
    if (!snapshot.normalizedScores || typeof snapshot.normalizedScores !== 'object') {
      return copy.errors.normalizedScoresMissing;
    }
  }

  return null;
}

function validateNormalizedScores(scoresA, scoresB) {
  const requiredKeys = [
    'fieldIndependFieldDepend',
    'wholisticAnalytic',
    'exploratoryDirected',
    'impulsiveReflective',
  ];
  const { NORMALIZED_SCORE_MIN, NORMALIZED_SCORE_MAX } = VALIDATION_RULES;

  for (const key of requiredKeys) {
    const a = scoresA[key];
    const b = scoresB[key];
    if (
      typeof a !== 'number' || Number.isNaN(a) || a < NORMALIZED_SCORE_MIN || a > NORMALIZED_SCORE_MAX ||
      typeof b !== 'number' || Number.isNaN(b) || b < NORMALIZED_SCORE_MIN || b > NORMALIZED_SCORE_MAX
    ) {
      return `normalizedScores.${key} 数据异常，请重新保存结果。`;
    }
  }

  return null;
}

function scoreByGap(delta, idealGap, tolerance, floor) {
  const raw = Math.exp(-((delta - idealGap) ** 2) / (2 * tolerance ** 2));
  return Math.round(floor + (100 - floor) * raw);
}

// v6: 盲区覆盖 — power transform 拉伸尾部
// coveragePotential = oppositeSide ? delta : delta * 0.5（同侧仍有半额覆盖）
// pow(coveragePotential, 0.6) 对低值放大 ~2-3x，对高值加速推向满分
// strengthFactor = 0.7 * maxStrength + 0.3 * minStrength（强方主导）
function coverageScore(delta, oppositeSide, maxStrength, minStrength) {
  const coveragePotential = oppositeSide ? delta : delta * 0.5;
  const coveragePower = COMPATIBILITY_CONFIG.aggregation.coveragePower;
  const strengthFactor = 0.7 * maxStrength + 0.3 * minStrength;
  return Math.round(100 * Math.pow(coveragePotential, coveragePower) * strengthFactor);
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
    scoreA,
    scoreB,
    avgStrength: (strengthA + strengthB) / 2,
    maxStrength: Math.max(strengthA, strengthB),
    minStrength: Math.min(strengthA, strengthB),
    oppositeSide: (scoreA - 0.5) * (scoreB - 0.5) < 0,
  };
}

// v6: pattern 判定仅用 raw 值
// complementary: blindSpot >= threshold AND cognitiveComplementarity >= threshold
function detectPairPattern(dimensions, blindSpotCoverage, frictionRisk, cognitiveComplementarity) {
  const patternConfig = COMPATIBILITY_CONFIG.pattern;

  // 四维平均 delta
  const avgDelta =
    patternConfig.averageDeltaDimensions.reduce(
      (sum, key) => sum + dimensions[key].delta,
      0
    ) / patternConfig.averageDeltaDimensions.length;

  // 1. homogeneous: 四维平均 delta < 0.12
  if (avgDelta < patternConfig.homogeneousMaxAvgDelta) {
    return 'homogeneous';
  }

  // 2. complementary: 盲区覆盖和认知互补同时达标（优先于 conflicting）
  if (
    blindSpotCoverage >= patternConfig.complementaryMinBlindSpot &&
    cognitiveComplementarity >= patternConfig.complementaryMinCogComp
  ) {
    return 'complementary';
  }

  // 3. conflicting: 高摩擦或两极分化，且不满足 complementary
  const extremeDims = patternConfig.averageDeltaDimensions.filter(
    (key) => dimensions[key].delta > patternConfig.conflictingExtremeDeltaThreshold
  );
  if (
    frictionRisk >= patternConfig.conflictingMinFrictionRisk ||
    extremeDims.length >= patternConfig.conflictingExtremeDeltaMinDims
  ) {
    return 'conflicting';
  }

  // 4. asymmetric: 兜底
  return 'asymmetric';
}

function buildDimensionResult(dimKey, label, delta, score) {
  const dimensionResultConfig = COMPATIBILITY_CONFIG.dimensionResult;
  const deltaFixed = Number(delta.toFixed(2));
  const dimInterpretations = copy.dimensionInterpretation[dimKey];

  const makeResult = (pattern) => ({
    score,
    delta: deltaFixed,
    interpretation: dimInterpretations[pattern],
    pattern,
  });

  if (deltaFixed < dimensionResultConfig.highlyAlignedMaxDelta) {
    return makeResult('similar');
  }

  if (deltaFixed > dimensionResultConfig.oppositeMinDelta) {
    // rhythm: 高差异映射为 polarized 而非 opposite
    if (dimKey === 'rhythm') {
      return makeResult('polarized');
    }
    return makeResult('opposite');
  }

  if (score >= dimensionResultConfig.complementaryMinScore) {
    return makeResult('complementary');
  }

  if (score >= dimensionResultConfig.moderateMinScore) {
    return makeResult('moderate');
  }

  return makeResult('friction');
}

function getRating(score) {
  return (
    COMPATIBILITY_CONFIG.rating.find((item) => score >= item.min)?.label ||
    COMPATIBILITY_CONFIG.rating[COMPATIBILITY_CONFIG.rating.length - 1].label
  );
}

// v5.6: summary 直接对应 4 种 patternBadge，不再按分数细分
function buildSummary(pattern) {
  return copy.summary[pattern] || copy.summary.asymmetric;
}

// v5.6: shareCaption 按 patternBadge 派发，不再按分数细分
function buildShareCaption(pattern) {
  return copy.shareCaption[pattern] || copy.shareCaption.asymmetric;
}

// v6.2: 任务推荐 — 动态角色映射 + 任务专属模板 + 节奏提醒
function buildMissionSuggestions(dimensions, dimensionContexts, pattern, pairCallSigns) {
  const taskTemplate = copy.taskTemplate;
  const dimensionRole = copy.dimensionRole;

  return COMPATIBILITY_CONFIG.missionWeights.map((mission) => {
    const fitScore = roundScore(
      Object.entries(mission.weights).reduce(
        (sum, [key, weight]) => sum + dimensions[key].score * weight,
        0
      )
    );

    const strongestKey = Object.entries(mission.weights).sort(
      ([dimensionKeyA, weightA], [dimensionKeyB, weightB]) =>
        dimensions[dimensionKeyB].score * weightB - dimensions[dimensionKeyA].score * weightA
    )[0][0];
    const strongestLabel = COMPATIBILITY_CONFIG.dimensions[strongestKey].shortLabel;

    // 适合原因：从 taskTemplate 按任务名 + strongestKey 查表
    const reasonFn = taskTemplate[mission.name]?.reason;
    const reason = reasonFn ? reasonFn(strongestLabel, strongestKey) : '';

    // 天然分工：仅当最强维度上双方跨中位线异侧时生成（同侧不产生分工结构）
    const ctx = dimensionContexts[strongestKey];
    // console.log('DEBUG role', { strongestKey, oppositeSide: ctx.oppositeSide, scoreA: ctx.scoreA, scoreB: ctx.scoreB });
    let role = '';
    if (ctx.oppositeSide) {
      const highPoleSign = ctx.scoreA > ctx.scoreB ? pairCallSigns.callSignA : pairCallSigns.callSignB;
      const lowPoleSign  = ctx.scoreA > ctx.scoreB ? pairCallSigns.callSignB : pairCallSigns.callSignA;
      const roleFn = dimensionRole[strongestKey];
      role = roleFn ? roleFn(highPoleSign, lowPoleSign) : '';
      // console.log('----DEBUG role', { role });
    }

    // 协作提醒：rhythm 维度为 friction/polarized 且任务有 warning 时追加
    const rhythmPattern = dimensions.rhythm?.pattern || '';
    const showWarning = rhythmPattern === 'friction' || rhythmPattern === 'polarized';
    const warning = showWarning ? (taskTemplate[mission.name]?.warning || '') : '';

    return { name: mission.name, department: mission.department, fitScore, reason, role, warning };
  })
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 3);
}

// v6.2: 行动建议 — 4 pattern 全覆盖 + 维度附加路由
function buildRecommendations(dimensions, breakdown, pattern, missionSuggestions) {
  const recCopy = copy.recommendations;

  // 1. bestFor / shouldAvoid: 直接按 pattern 查表
  const bestFor = [...(recCopy.bestFor[pattern] || [])];
  const shouldAvoid = [...(recCopy.shouldAvoid[pattern] || [])];

  // 2. communicationTips: pattern 基础 + 维度附加
  const communicationTips = [...(recCopy.communicationTips._base[pattern] || [])];

  for (const [dimKey, dimResult] of Object.entries(dimensions)) {
    const triggerPattern = dimResult.pattern;
    if (triggerPattern === 'friction' || triggerPattern === 'opposite' || triggerPattern === 'polarized') {
      const tip = recCopy.communicationTips._byDimension[dimKey]?.[triggerPattern];
      if (tip) communicationTips.push(tip);
    }
  }

  // 3. homogeneous 盲区加持（保留）
  if (pattern === 'homogeneous' && breakdown.blindSpotCoverage < 15) {
    communicationTips.push(
      '你们的盲区高度重合——关键决策时找一个第三方帮你们看看，会让结果更完整。'
    );
  }

  return { bestFor, shouldAvoid, communicationTips, missionSuggestions };
}

function safeDisplay(display) {
  if (!display || typeof display !== 'object') {
    return {
      displayName: '',
      callSign: '',
      department: '',
      rank: '',
      avatar: '',
    };
  }
  return {
    displayName: typeof display.displayName === 'string' ? display.displayName.slice(0, VALIDATION_RULES.DISPLAY_MAX_LENGTH) : '',
    callSign: typeof display.callSign === 'string' ? display.callSign.slice(0, VALIDATION_RULES.DISPLAY_MAX_LENGTH) : '',
    department: typeof display.department === 'string' ? display.department.slice(0, VALIDATION_RULES.DISPLAY_MAX_LENGTH) : '',
    rank: typeof display.rank === 'string' ? display.rank.slice(0, VALIDATION_RULES.DISPLAY_MAX_LENGTH) : '',
    avatar: typeof display.avatar === 'string' ? display.avatar.slice(0, VALIDATION_RULES.AVATAR_MAX_LENGTH) : '',
  };
}

export function buildCompatibilityReport(userA, userB) {
  const a = userA.normalizedScores;
  const b = userB.normalizedScores;

  // 1. 维度上下文（4维 deltas + strength + oppositeSide）
  const dimensionContexts = Object.fromEntries(
    Object.entries(COMPATIBILITY_CONFIG.dimensions).map(([key, config]) => [
      key,
      getDimensionContext(a[config.sourceKey], b[config.sourceKey]),
    ])
  );

  // 2. 维度高斯核评分（F/V/D 用于 cognitiveComplementarity；R 用于 rhythmSynergy）
  const dimensionScores = Object.fromEntries(
    Object.entries(COMPATIBILITY_CONFIG.dimensions).map(([key, config]) => [
      key,
      scoreByGap(
        dimensionContexts[key].delta,
        config.idealGap,
        config.tolerance,
        config.floor
      ),
    ])
  );

  // 3. 9.3-A: 核心认知互补度 — 仅 F/V/D，近似等权
  const cognitiveComplementarity = roundScore(
    Object.entries(COMPATIBILITY_CONFIG.aggregation.cognitiveComplementarity).reduce(
      (sum, [key, weight]) => sum + dimensionScores[key] * weight,
      0
    )
  );

  const coreDims = ['field', 'vision', 'direction'];

  // 4. 9.3-B: 盲区覆盖度 — coveragePotential × strengthFactor
  const coverageDebug = {}; // P2 诊断：收集每维中间值
  const blindSpotCoverage = roundScore(
    coreDims.reduce(
      (sum, key) => {
        const ctx = dimensionContexts[key];
        const coveragePotential = ctx.oppositeSide ? ctx.delta : ctx.delta * 0.5;
        const coveragePower = COMPATIBILITY_CONFIG.aggregation.coveragePower;
        const strengthFactor = 0.7 * ctx.maxStrength + 0.3 * ctx.minStrength;
        const rawCoverage = 100 * Math.pow(coveragePotential, coveragePower) * strengthFactor;
        coverageDebug[key] = {
          delta: Number(ctx.delta.toFixed(2)),
          oppositeSide: ctx.oppositeSide,
          coveragePotential: Number(coveragePotential.toFixed(2)),
          strengthFactor: Number(strengthFactor.toFixed(2)),
          rawCoverage: Math.round(rawCoverage),
        };
        return sum + rawCoverage;
      },
      0
    ) / coreDims.length
  );

  // 5. 9.3-C: 摩擦风险 — 4维加权
  const frictionRisk = roundScore(
    Object.entries(COMPATIBILITY_CONFIG.friction).reduce(
      (sum, [key, config]) =>
        sum +
        riskScore(
          dimensionContexts[key].delta,
          dimensionContexts[key].avgStrength,
          config.dangerStart
        ) *
          config.weight,
      0
    )
  );

  // 6. 9.3-D: 节奏协同度 — R 唯一专项评分通道
  const rhythmSynergy = dimensionScores.rhythm;

  // 7. 维度结果（五类差异类型判定 + 文案）
  const dimensions = Object.fromEntries(
    Object.entries(COMPATIBILITY_CONFIG.dimensions).map(([key, config]) => [
      key,
      {
        ...buildDimensionResult(key, config.label, dimensionContexts[key].delta, dimensionScores[key]),
        shortLabel: config.shortLabel || config.label,
        description: config.discription || '',
      },
    ])
  );

  const dimEntries = Object.entries(dimensions);
  const highlightOrder = dimEntries
    .map(([key, dim]) => {
      let priority = 0;
      if (dim.pattern === 'complementary') priority = 5;
      else if (dim.pattern === 'opposite' || dim.pattern === 'polarized') priority = 4;
      else if (dim.pattern === 'moderate') priority = 3;
      else if (dim.pattern === 'friction') priority = 2;
      else if (dim.pattern === 'similar') priority = 1;
      return { key, dim, priority };
    })
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.dim.score - a.dim.score;
    });

  const highlightKeys = new Set(highlightOrder.slice(0, 2).map((h) => h.key));

  for (const [key, dim] of dimEntries) {
    dim.highlight = highlightKeys.has(key);
    dim.oneLiner = copy.dimensionOneLiner[key]?.[dim.pattern] || dim.interpretation;
  }

  // 9. 9.6: 组合模式判定（raw 值，无 circularity）
  const pattern = detectPairPattern(dimensions, blindSpotCoverage, frictionRisk, cognitiveComplementarity);

  // 10. 9.4: 搭档指数 — 4 子分加权
  const aggregation = COMPATIBILITY_CONFIG.aggregation.overall;

  let partnerIndex = roundScore(
    cognitiveComplementarity * aggregation.cognitiveComplementarity +
    blindSpotCoverage * aggregation.blindSpotCoverage +
    rhythmSynergy * aggregation.rhythmSynergy +
    (100 - frictionRisk) * aggregation.inverseFrictionRisk
  );

  // homogeneous 保底分（floor，不是加分）
  if (pattern === 'homogeneous') {
    partnerIndex = Math.max(partnerIndex, COMPATIBILITY_CONFIG.aggregation.homogeneousFloor);
  }

  const breakdown = {
    cognitiveComplementarity,
    blindSpotCoverage,
    frictionRisk,
    rhythmSynergy,
  };

  // v6.2: 子分 Tooltip 随报告下发
  const breakdownTooltips = copy.breakdownTooltip;

  const missionSuggestions = buildMissionSuggestions(dimensions, dimensionContexts, pattern, {
    callSignA: safeDisplay(userA.display).callSign || userA.profileId || 'A',
    callSignB: safeDisplay(userB.display).callSign || userB.profileId || 'B',
  });

  const displayA = safeDisplay(userA.display);
  const displayB = safeDisplay(userB.display);

  const patternBadge = copy.patternBadge[pattern] || copy.patternBadge.asymmetric;

  return {
    reportVersion: API_VERSIONS.COMPATIBILITY_REPORT_VERSION,
    generatedAt: Date.now(),
    readingGuide: copy.readingGuide,
    pair: {
      userA: {
        friendId: userA.friendId || '',
        profileId: userA.profileId || '',
        displayName: displayA.displayName,
        callSign: displayA.callSign,
        department: displayA.department,
        rank: displayA.rank,
        avatar: displayA.avatar,
      },
      userB: {
        friendId: userB.friendId || '',
        profileId: userB.profileId || '',
        displayName: displayB.displayName,
        callSign: displayB.callSign,
        department: displayB.department,
        rank: displayB.rank,
        avatar: displayB.avatar,
      },
    },
    overall: {
      score: partnerIndex,
      rating: getRating(partnerIndex),
      pattern,
      patternBadge,
      summary: buildSummary(pattern),
      shareCaption: buildShareCaption(pattern),
    },
    breakdown,
    breakdownTooltips,
    dimensions,
    recommendations: buildRecommendations(dimensions, breakdown, pattern, missionSuggestions),
    _coverageDebug: coverageDebug,  // P2 诊断字段（后续版本移除）
  };
}

export function buildPublicCompatibilityReport(report, token, expiresAt) {
  return {
    token,
    createdAt: Date.now(),
    expiresAt,
    reportVersion: API_VERSIONS.PUBLIC_SHARE_VERSION,
    readingGuide: report.readingGuide,
    pair: report.pair,
    overall: report.overall,
    breakdown: report.breakdown,
    breakdownTooltips: report.breakdownTooltips,
    dimensions: report.dimensions,
    recommendations: report.recommendations,
  };
}
