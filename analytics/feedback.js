import {
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
} from '../shared/api-utils.js';

const VALID_RATINGS = ['accurate', 'neutral', 'inaccurate'];

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
      { error: '存储服务未配置。', code: 'INTERNAL_ERROR' },
      COMMON_HEADERS,
      { status: 500 }
    );
  }

  try {
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

    if (!payload.reportId || typeof payload.reportId !== 'string' || payload.reportId.length < 8) {
      return json(
        { error: 'reportId 非法。', code: 'BAD_REQUEST' },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    if (!VALID_RATINGS.includes(payload.rating)) {
      return json(
        { error: 'rating 必须是 accurate / neutral / inaccurate 之一。', code: 'BAD_REQUEST' },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    const record = {
      reportId: payload.reportId,
      createdAt: Date.now(),
      rating: payload.rating,
    };

    await kv.put(
      `${KV_KEY_PREFIXES.ANALYTICS.FEEDBACK}${payload.reportId}`,
      JSON.stringify(record),
      { expirationTtl: TTL.SNAPSHOT_SECONDS }
    );

    return json({ success: true }, COMMON_HEADERS);
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : '服务器内部错误',
        code: 'INTERNAL_ERROR',
      },
      COMMON_HEADERS,
      { status: 500 }
    );
  }
}