const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Content-Type-Options': 'nosniff',
};

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_KEY_PREFIX = 'rate-limit:results-delete:';
const RESULT_KEY_PREFIX = 'result:';

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
    const validationError = validateDeletePayload(payload);
    if (validationError) {
      return json({ error: validationError, code: 'BAD_REQUEST' }, { status: 400 });
    }

    const recordKey = `${RESULT_KEY_PREFIX}${payload.friendId}`;
    const raw = await kv.get(recordKey);
    if (!raw) {
      return json(
        { error: '未找到该结果，可能已过期或已删除。', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const record = JSON.parse(raw);
    const deleteTokenHash = await sha256Hex(payload.deleteToken);
    if (record.deleteTokenHash !== deleteTokenHash) {
      return json(
        { error: '删除凭证无效，无法删除该结果。', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    await kv.delete(recordKey);
    return json({ success: true });
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

function getSnapshotKv(env) {
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

function validateDeletePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return '请求体必须为 JSON 对象。';
  }
  if (typeof payload.friendId !== 'string' || payload.friendId.length < 6) {
    return 'friendId 非法。';
  }
  if (typeof payload.deleteToken !== 'string' || payload.deleteToken.length < 16) {
    return 'deleteToken 非法。';
  }
  return null;
}

async function sha256Hex(input) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
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
