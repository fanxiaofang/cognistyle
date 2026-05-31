import {
  API_VERSIONS,
  KV_KEY_PREFIXES,
  DEFAULT_RATE_LIMIT,
  TTL,
  COMMON_HEADERS,
} from './shared/api-constants.js';
import {
  getSnapshotKv,
  hitRateLimit,
  extractClientIp,
  generateUrlSafeToken,
  sha256Hex,
  json,
} from './shared/api-utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  let stage = 'init';

  const envKeys = Object.keys(env);
  const kv = getSnapshotKv(env);

  if (!kv) {
    return json(
      {
        error: '结果存储未配置，请先绑定 KV。',
        code: 'INTERNAL_ERROR',
        debug: {
          envKeys,
          hasResultSnapshotKvOnEnv: !!env.RESULT_SNAPSHOT_KV,
          hasMyKvOnEnv: !!env.MY_KV,
          hasResultSnapshotKvOnGlobal: typeof globalThis.RESULT_SNAPSHOT_KV !== 'undefined',
          hasMyKvOnGlobal: typeof globalThis.MY_KV !== 'undefined',
        },
      },
      COMMON_HEADERS,
      { status: 500 }
    );
  }

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

  try {
    stage = 'rate-limit';
    const clientIp = extractClientIp(request);
    const limited = await hitRateLimit(
      kv,
      clientIp,
      KV_KEY_PREFIXES.RATE_LIMIT.RESULTS,
      DEFAULT_RATE_LIMIT.RESULTS_MAX
    );
    if (limited) {
      return json(
        { error: '请求过于频繁，请稍后重试。', code: 'RATE_LIMITED' },
        COMMON_HEADERS,
        { status: 429 }
      );
    }

    stage = 'parse-json';
    let payload;
    try {
      payload = await request.json();
    } catch (parseErr) {
      return json(
        {
          error: '请求体 JSON 解析失败',
          code: 'BAD_REQUEST',
          detail: parseErr.message,
        },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    stage = 'validate';
    const validationError = validateSnapshotPayload(payload);
    if (validationError) {
      return json(
        {
          error: validationError,
          code: 'BAD_REQUEST',
          received: {
            questionVersion: payload?.questionVersion,
            snapshotVersion: payload?.snapshotVersion,
            category: payload?.category,
          },
        },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    stage = 'generate-tokens';
    const friendId = generateUrlSafeToken(9);
    const deleteToken = generateUrlSafeToken(24);

    stage = 'sha256';
    const deleteTokenHash = await sha256Hex(deleteToken);

    stage = 'prepare-record';
    const now = Date.now();
    const expiresAt = now + TTL.SNAPSHOT_SECONDS * 1000;

    const record = {
      ...payload,
      friendId,
      deleteTokenHash,
      createdAt: now,
      expiresAt,
    };

    stage = 'kv-put';
    await kv.put(`${KV_KEY_PREFIXES.RESULT}${friendId}`, JSON.stringify(record), {
      expirationTtl: TTL.SNAPSHOT_SECONDS,
    });

    return json(
      {
        friendId,
        deleteToken,
        expiresAt,
      },
      COMMON_HEADERS
    );
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : '服务器内部错误',
        code: 'INTERNAL_ERROR',
        stage: stage,
        stack: error instanceof Error ? error.stack : undefined,
        errorType: error?.constructor?.name,
      },
      COMMON_HEADERS,
      { status: 500 }
    );
  }
}

function validateSnapshotPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return '请求体必须为 JSON 对象。';
  }

  if (payload.category !== 'general') {
    return '当前仅支持 general 分类。';
  }

  if (payload.questionVersion !== API_VERSIONS.QUESTION_VERSION) {
    return 'questionVersion 不匹配。';
  }

  if (payload.snapshotVersion !== API_VERSIONS.SNAPSHOT_VERSION) {
    return 'snapshotVersion 不匹配。';
  }

  if (typeof payload.profileId !== 'string' || payload.profileId.length > 20) {
    return 'profileId 非法。';
  }

  const archetypes = ['primaryArchetype', 'secondaryArchetype'];
  for (const field of archetypes) {
    const value = payload[field];
    if (!value || typeof value !== 'object') {
      return `${field} 缺失。`;
    }
    if (typeof value.key !== 'string' || value.key.length > 12) {
      return `${field}.key 非法。`;
    }
    if (
      typeof value.matchScore !== 'number' ||
      Number.isNaN(value.matchScore) ||
      value.matchScore < 0 ||
      value.matchScore > 100
    ) {
      return `${field}.matchScore 必须为 0-100 的数字。`;
    }
  }

  const scores = payload.normalizedScores;
  if (!scores || typeof scores !== 'object') {
    return 'normalizedScores 缺失。';
  }

  const requiredScoreKeys = [
    'impulsiveReflective',
    'convergentDivergent',
    'wholisticAnalytic',
    'soloTeam',
  ];

  for (const key of requiredScoreKeys) {
    const value = scores[key];
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0 || value > 1) {
      return `normalizedScores.${key} 必须为 0 到 1 之间的数字。`;
    }
  }

  const display = payload.display;
  if (!display || typeof display !== 'object') {
    return 'display 缺失。';
  }

  const displayRules = {
    displayName: 50,
    callSign: 50,
    department: 50,
    rank: 50,
    avatar: 10,
  };

  for (const [field, maxLength] of Object.entries(displayRules)) {
    if (typeof display[field] !== 'string' || display[field].length === 0) {
      return `display.${field} 缺失。`;
    }
    if (display[field].length > maxLength) {
      return `display.${field} 长度超出限制。`;
    }
  }

  return null;
}
