import {
  API_VERSIONS,
  KV_KEY_PREFIXES,
  DEFAULT_RATE_LIMIT,
  TTL,
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

const VALID_PATTERNS = ['homogeneous', 'complementary', 'asymmetric', 'conflicting'];

function validateHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return 'entry 必须为对象';
  }
  if (!validateFriendIdFormat(entry.targetFriendId)) {
    return 'targetFriendId 格式无效';
  }
  if (typeof entry.targetProfileId !== 'string' || entry.targetProfileId.length > 20) {
    return 'targetProfileId 非法';
  }
  if (typeof entry.targetDisplayName !== 'string' || entry.targetDisplayName.length > 50) {
    return 'targetDisplayName 非法';
  }
  if (typeof entry.targetCallSign !== 'string') {
    return 'targetCallSign 缺失';
  }
  if (typeof entry.targetDepartment !== 'string') {
    return 'targetDepartment 缺失';
  }
  if (typeof entry.overallScore !== 'number' || entry.overallScore < 0 || entry.overallScore > 100) {
    return 'overallScore 必须在 0-100 之间';
  }
  if (!VALID_PATTERNS.includes(entry.pattern)) {
    return '无效的 pattern';
  }
  if (typeof entry.generatedAt !== 'number' || entry.generatedAt <= 0) {
    return 'generatedAt 无效';
  }
  return null;
}

function buildSuccessResponse(data) {
  return { data };
}

function buildErrorResponse(code, message) {
  return { error: { code, message } };
}

function capEntries(entries, max) {
  if (entries.length <= max) return entries;
  return entries
    .slice()
    .sort((a, b) => b.generatedAt - a.generatedAt)
    .slice(0, max);
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: COMMON_HEADERS });
  }

  if (request.method !== 'POST') {
    return json(
      buildErrorResponse('BAD_REQUEST', 'Method Not Allowed'),
      COMMON_HEADERS,
      { status: 405 }
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
      KV_KEY_PREFIXES.RATE_LIMIT.HISTORY_WRITE,
      DEFAULT_RATE_LIMIT.HISTORY_WRITE_MAX
    );
    if (limited) {
      return json(
        buildErrorResponse('RATE_LIMITED', '请求过于频繁，请稍后重试。'),
        COMMON_HEADERS,
        { status: 429 }
      );
    }

    const payload = await request.json().catch(() => null);
    if (!payload) {
      return json(
        buildErrorResponse('BAD_REQUEST', '请求体 JSON 解析失败'),
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    if (!payload.friendId || !validateFriendIdFormat(payload.friendId)) {
      return json(
        buildErrorResponse('BAD_REQUEST', 'friendId 格式无效'),
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    if (payload.version !== API_VERSIONS.DUAL_HISTORY_VERSION) {
      return json(
        buildErrorResponse('CONFLICT', '数据版本不匹配，请刷新页面。'),
        COMMON_HEADERS,
        { status: 409 }
      );
    }

    if (!Array.isArray(payload.entries) || payload.entries.length === 0) {
      return json(
        buildErrorResponse('BAD_REQUEST', 'entries 必须为非空数组'),
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    for (let i = 0; i < payload.entries.length; i++) {
      const entryError = validateHistoryEntry(payload.entries[i]);
      if (entryError) {
        return json(
          buildErrorResponse('BAD_REQUEST', `entries[${i}]: ${entryError}`),
          COMMON_HEADERS,
          { status: 400 }
        );
      }
    }

    const resultKey = `${KV_KEY_PREFIXES.RESULT}${payload.friendId}`;
    const resultRaw = await kv.get(resultKey);
    if (!resultRaw) {
      return json(
        buildErrorResponse('NOT_FOUND', '识别码不存在或已过期，请先保存测评结果。'),
        COMMON_HEADERS,
        { status: 404 }
      );
    }

    const historyKey = `${KV_KEY_PREFIXES.HISTORY}${payload.friendId}`;
    const raw = await kv.get(historyKey);

    let entries = [];

    if (raw) {
      const existing = safeParseJson(raw);
      if (existing) {
        entries = Array.isArray(existing.entries) ? existing.entries : [];
      }
    }

    const entryMap = new Map();
    for (const e of entries) {
      entryMap.set(e.targetFriendId, e);
    }

    for (const newEntry of payload.entries) {
      entryMap.set(newEntry.targetFriendId, { ...newEntry });
    }

    entries = capEntries(
      Array.from(entryMap.values()),
      DEFAULT_RATE_LIMIT.MAX_HISTORY_ENTRIES
    );

    const updated = {
      version: API_VERSIONS.DUAL_HISTORY_VERSION,
      friendId: payload.friendId,
      entries,
      updatedAt: Date.now(),
    };

    await kv.put(historyKey, JSON.stringify(updated), {
      expirationTtl: TTL.SNAPSHOT_SECONDS,
    });

    return json(
      buildSuccessResponse({
        success: true,
        syncedAt: updated.updatedAt,
        totalEntries: entries.length,
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
