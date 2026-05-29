import {
  COMPATIBILITY_CONFIG,
  COMPATIBILITY_COPY,
  DEFAULT_LOCALE,
} from './compatibility-report.config.js';
import {
  API_VERSIONS,
  KV_KEY_PREFIXES,
  DEFAULT_RATE_LIMIT,
  VALIDATION_RULES,
  COMMON_HEADERS,
} from './shared/api-constants.js';
import {
  getSnapshotKv,
  hitRateLimit,
  extractClientIp,
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
    return json(
      { error: copy.errors.storageMissing, code: 'INTERNAL_ERROR' },
      COMMON_HEADERS,
      { status: 500 }
    );
  }

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
    return json(report, COMMON_HEADERS);
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
  const requiredKeys = ['impulsiveReflective', 'convergentDivergent', 'wholisticAnalytic', 'soloTeam'];
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

function coverageScore(delta, oppositeSide, avgStrength) {
  const coverageConfig = COMPATIBILITY_CONFIG.coverage;
  const gapFactor = Math.max(
    0,
    1 - Math.abs(delta - coverageConfig.idealGap) / coverageConfig.idealGap
  );
  const sideBonus = oppositeSide ? 1 : coverageConfig.sameSideBonus;
  const strengthFactor =
    coverageConfig.baseStrengthFactor + avgStrength * coverageConfig.strengthWeight;
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

function detectPairPattern(dimensions, breakdown) {
  const patternConfig = COMPATIBILITY_CONFIG.pattern;
  const avgDelta =
    patternConfig.cognitiveDimensions.reduce((sum, key) => sum + dimensions[key].delta, 0) /
    patternConfig.cognitiveDimensions.length;
  const collaborationDelta = dimensions.collaboration.delta;
  const collaborationScore = dimensions.collaboration.score;

  if (
    avgDelta < patternConfig.homogeneousMaxAvgDelta &&
    collaborationDelta < patternConfig.homogeneousMaxCollaborationDelta &&
    breakdown.blindSpotCoverage < patternConfig.homogeneousMaxBlindSpotCoverage
  ) {
    return 'homogeneous';
  }

  if (
    breakdown.frictionRisk >= patternConfig.conflictingMinFrictionRisk ||
    dimensions.rhythm.delta > patternConfig.conflictingRhythmDeltaThreshold ||
    collaborationDelta > patternConfig.conflictingCollaborationDeltaThreshold ||
    collaborationScore < patternConfig.conflictingMaxCollaborationScore
  ) {
    return 'conflicting';
  }

  if (
    breakdown.blindSpotCoverage >= patternConfig.complementaryMinBlindSpotCoverage &&
    avgDelta >= patternConfig.complementaryMinAvgDelta &&
    avgDelta <= patternConfig.complementaryMaxAvgDelta &&
    collaborationScore >= patternConfig.complementaryMinCollaborationScore
  ) {
    return 'complementary';
  }

  return 'asymmetric';
}

function buildDimensionResult(label, delta, score) {
  const dimensionResultConfig = COMPATIBILITY_CONFIG.dimensionResult;
  const deltaFixed = Number(delta.toFixed(2));

  if (deltaFixed < dimensionResultConfig.highlyAlignedMaxDelta) {
    return {
      score,
      delta: deltaFixed,
      interpretation: copy.dimensionInterpretation.similar(label, deltaFixed),
      pattern: 'similar',
    };
  }

  if (deltaFixed > dimensionResultConfig.oppositeMinDelta) {
    return {
      score,
      delta: deltaFixed,
      interpretation: copy.dimensionInterpretation.opposite(label, deltaFixed),
      pattern: 'opposite',
    };
  }

  if (score >= dimensionResultConfig.complementaryMinScore) {
    return {
      score,
      delta: deltaFixed,
      interpretation: copy.dimensionInterpretation.complementary(label),
      pattern: 'complementary',
    };
  }

  if (score >= dimensionResultConfig.moderateMinScore) {
    return {
      score,
      delta: deltaFixed,
      interpretation: copy.dimensionInterpretation.moderate(label),
      pattern: 'moderate',
    };
  }

  return {
    score,
    delta: deltaFixed,
    interpretation: copy.dimensionInterpretation.friction(label),
    pattern: 'friction',
  };
}

function getRating(score) {
  return (
    COMPATIBILITY_CONFIG.rating.find((item) => score >= item.min)?.label ||
    COMPATIBILITY_CONFIG.rating[COMPATIBILITY_CONFIG.rating.length - 1].label
  );
}

function buildSummary(overallScore, breakdown, pattern) {
  if (pattern === 'homogeneous') {
    return copy.summary.homogeneous;
  }

  if (pattern === 'conflicting') {
    return copy.summary.conflicting;
  }

  if (overallScore >= 80) {
    return copy.summary.excellent;
  }
  if (overallScore >= 65) {
    return copy.summary.strong;
  }
  if (overallScore >= 50) {
    return copy.summary.workable;
  }
  if (breakdown.frictionRisk >= 60) {
    return copy.summary.highFriction;
  }
  return copy.summary.default;
}

function buildMissionSuggestions(dimensions, pattern) {
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
    const strongest = COMPATIBILITY_CONFIG.dimensions[strongestKey].shortLabel;

    let reason;
    if (pattern === 'homogeneous') {
      reason = copy.missionReason.homogeneous(strongest);
    } else if (pattern === 'conflicting') {
      reason = copy.missionReason.conflicting(strongest);
    } else {
      reason = copy.missionReason.default(strongest);
    }

    return {
      name: mission.name,
      department: mission.department,
      fitScore,
      reason,
    };
  })
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 3);
}

function buildRecommendations(dimensions, breakdown, pattern, missionSuggestions) {
  const recommendationCopy = copy.recommendations;
  const bestFor = [];
  const shouldAvoid = [];
  const communicationTips = [];

  if (pattern === 'homogeneous') {
    bestFor.push(...recommendationCopy.bestFor.homogeneous);
  } else if (pattern === 'conflicting') {
    bestFor.push(...recommendationCopy.bestFor.conflicting);
  } else if (dimensions.strategy.score >= 70 && dimensions.vision.score >= 70) {
    bestFor.push(recommendationCopy.bestFor.strategyVisionStrong);
  } else if (breakdown.cognitiveComplementarity >= 65) {
    bestFor.push(recommendationCopy.bestFor.highComplementarity);
  } else {
    bestFor.push(recommendationCopy.bestFor.default);
  }

  if (dimensions.collaboration.score >= 70) {
    bestFor.push(recommendationCopy.bestFor.highCollaboration);
  } else {
    bestFor.push(recommendationCopy.bestFor.asyncCollaboration);
  }

  if (pattern === 'homogeneous') {
    shouldAvoid.push(...recommendationCopy.shouldAvoid.homogeneous);
  } else if (pattern === 'conflicting') {
    shouldAvoid.push(...recommendationCopy.shouldAvoid.conflicting);
  } else {
    if (breakdown.frictionRisk >= 60) {
      shouldAvoid.push(recommendationCopy.shouldAvoid.highFriction);
    }
    if (dimensions.rhythm.score < 45) {
      shouldAvoid.push(recommendationCopy.shouldAvoid.lowRhythm);
    }
    if (dimensions.collaboration.score < 45) {
      shouldAvoid.push(recommendationCopy.shouldAvoid.lowCollaboration);
    }
    if (shouldAvoid.length === 0) {
      shouldAvoid.push(recommendationCopy.shouldAvoid.default);
    }
  }

  if (pattern === 'homogeneous') {
    communicationTips.push(...recommendationCopy.communicationTips.homogeneous);
    if (breakdown.blindSpotCoverage < 15) {
      communicationTips.push(recommendationCopy.communicationTips.homogeneousBlindSpot);
    }
  } else if (pattern === 'conflicting') {
    communicationTips.push(...recommendationCopy.communicationTips.conflicting);
  } else {
    if (dimensions.rhythm.score < 55) {
      communicationTips.push(recommendationCopy.communicationTips.lowRhythm);
    } else {
      communicationTips.push(recommendationCopy.communicationTips.highRhythm);
    }

    if (dimensions.collaboration.score < 55) {
      communicationTips.push(recommendationCopy.communicationTips.lowCollaboration);
    } else {
      communicationTips.push(recommendationCopy.communicationTips.highCollaboration);
    }

    if (breakdown.blindSpotCoverage >= 65) {
      communicationTips.push(recommendationCopy.communicationTips.highBlindSpot);
    } else {
      communicationTips.push(recommendationCopy.communicationTips.default);
    }
  }

  return {
    bestFor,
    shouldAvoid,
    communicationTips,
    missionSuggestions,
  };
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

  const dimensionContexts = Object.fromEntries(
    Object.entries(COMPATIBILITY_CONFIG.dimensions).map(([key, config]) => [
      key,
      getDimensionContext(a[config.sourceKey], b[config.sourceKey]),
    ])
  );
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

  const cognitiveComplementarity = roundScore(
    Object.entries(COMPATIBILITY_CONFIG.aggregation.cognitiveComplementarity).reduce(
      (sum, [key, weight]) => sum + dimensionScores[key] * weight,
      0
    )
  );
  const collaborationCompatibility = dimensionScores.collaboration;
  const blindSpotCoverage = roundScore(
    (
      COMPATIBILITY_CONFIG.pattern.cognitiveDimensions.reduce(
        (sum, key) =>
          sum +
          coverageScore(
            dimensionContexts[key].delta,
            dimensionContexts[key].oppositeSide,
            dimensionContexts[key].avgStrength
          ),
        0
      )
    ) / COMPATIBILITY_CONFIG.pattern.cognitiveDimensions.length
  );
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

  const overallScore = roundScore(
    cognitiveComplementarity * COMPATIBILITY_CONFIG.aggregation.overall.cognitiveComplementarity +
      collaborationCompatibility *
        COMPATIBILITY_CONFIG.aggregation.overall.collaborationCompatibility +
      blindSpotCoverage * COMPATIBILITY_CONFIG.aggregation.overall.blindSpotCoverage +
      (100 - frictionRisk) * COMPATIBILITY_CONFIG.aggregation.overall.inverseFrictionRisk
  );

  const dimensions = Object.fromEntries(
    Object.entries(COMPATIBILITY_CONFIG.dimensions).map(([key, config]) => [
      key,
      buildDimensionResult(config.label, dimensionContexts[key].delta, dimensionScores[key]),
    ])
  );

  const breakdown = {
    cognitiveComplementarity,
    collaborationCompatibility,
    blindSpotCoverage,
    frictionRisk,
  };

  const pattern = detectPairPattern(dimensions, breakdown);
  const missionSuggestions = buildMissionSuggestions(dimensions, pattern);

  const displayA = safeDisplay(userA.display);
  const displayB = safeDisplay(userB.display);

  return {
    reportVersion: API_VERSIONS.COMPATIBILITY_REPORT_VERSION,
    generatedAt: Date.now(),
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
      score: overallScore,
      rating: getRating(overallScore),
      summary: buildSummary(overallScore, breakdown, pattern),
    },
    breakdown,
    dimensions,
    recommendations: buildRecommendations(dimensions, breakdown, pattern, missionSuggestions),
  };
}

export function buildPublicCompatibilityReport(report, token, expiresAt) {
  return {
    token,
    createdAt: Date.now(),
    expiresAt,
    reportVersion: API_VERSIONS.PUBLIC_SHARE_VERSION,
    pair: report.pair,
    overall: report.overall,
    breakdown: report.breakdown,
    dimensions: report.dimensions,
    recommendations: report.recommendations,
  };
}
