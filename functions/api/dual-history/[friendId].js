import {
  API_VERSIONS,
  KV_KEY_PREFIXES,
  DEFAULT_RATE_LIMIT,
  COMMON_HEADERS,
} from '../shared/api-constants.js';
import {
  getSnapshotKv,
  hitRateLimit,
  extractClientIp,
  json,
  safeParseJson,
  validateFriendIdFormat,
} from '../shared/api-utils.js';

function buildSuccessResponse(data) {
  return { data };
}

function buildErrorResponse(code, message) {
  return { error: { code, message } };
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const friendId = params.friendId;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: COMMON_HEADERS });
  }

  if (request.method !== 'GET') {
    return json(
      buildErrorResponse('BAD_REQUEST', 'Method Not Allowed'),
      COMMON_HEADERS,
      { status: 405 }
    );
  }

  if (!friendId || !validateFriendIdFormat(friendId)) {
    return json(
      buildErrorResponse('BAD_REQUEST', 'friendId 格式无效'),
      COMMON_HEADERS,
      { status: 400 }
    );
  }

  const kv = getSnapshotKv(env);
  if (!kv) {
    return json(
      buildErrorResponse('INTERNAL_ERROR', '存储服务未配置。'),
      COMMON_HEADERS,
      { status: 500 }
    );
  }

  try {
    const clientIp = extractClientIp(request);
    const limited = await hitRateLimit(
      kv,
      clientIp,
      KV_KEY_PREFIXES.RATE_LIMIT.HISTORY_READ,
      DEFAULT_RATE_LIMIT.HISTORY_READ_MAX
    );
    if (limited) {
      return json(
        buildErrorResponse('RATE_LIMITED', '请求过于频繁，请稍后重试。'),
        COMMON_HEADERS,
        { status: 429 }
      );
    }

    const historyKey = `${KV_KEY_PREFIXES.HISTORY}${friendId}`;
    const raw = await kv.get(historyKey);

    if (!raw) {
      return json(
        buildSuccessResponse({
          friendId,
          version: API_VERSIONS.DUAL_HISTORY_VERSION,
          entries: [],
          fetchedAt: Date.now(),
        }),
        COMMON_HEADERS
      );
    }

    const existing = safeParseJson(raw);
    if (!existing) {
      return json(
        buildSuccessResponse({
          friendId,
          version: API_VERSIONS.DUAL_HISTORY_VERSION,
          entries: [],
          fetchedAt: Date.now(),
        }),
        COMMON_HEADERS
      );
    }

    const entries = Array.isArray(existing.entries) ? existing.entries : [];

    return json(
      buildSuccessResponse({
        friendId,
        version: API_VERSIONS.DUAL_HISTORY_VERSION,
        entries,
        fetchedAt: Date.now(),
      }),
      COMMON_HEADERS
    );
  } catch (error) {
    return json(
      buildErrorResponse(
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : '服务器内部错误'
      ),
      COMMON_HEADERS,
      { status: 500 }
    );
  }
}
